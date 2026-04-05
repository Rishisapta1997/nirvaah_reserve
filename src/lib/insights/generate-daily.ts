import { callLLMWithJSON, generateInsights } from '../llm/analyst';
import { DAILY_INSIGHT_PROMPT, SYSTEM_PROMPT } from '../llm/prompts';
import { fetchMetricsForDate, fetchTopProducts, fetchInventoryAlerts, saveDailySnapshot } from './data-fetcher';
import { pool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export interface DailyInsight {
  date: string;
  yesterday_summary: string;
  today_predictions: {
    expected_revenue: string;
    expected_orders: string;
    confidence: 'high' | 'medium' | 'low';
  };
  actionables: Array<{
    priority: 'high' | 'medium' | 'low';
    task: string;
    reason: string;
    expected_impact: string;
    deadline: string;
  }>;
  risks: Array<{
    risk: string;
    likelihood: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
  opportunities: Array<{
    opportunity: string;
    potential: string;
    action: string;
  }>;
}

export async function generateDailyInsight(force = false): Promise<DailyInsight> {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const cacheKey = today;

  if (!force) {
    const cached = await pool.query(
      `SELECT response FROM insights_cache WHERE insight_type = 'daily' AND period_key = $1`,
      [cacheKey]
    );
    if (cached.rows.length > 0) {
      return cached.rows[0].response;
    }
  }

  const [yesterdayMetrics, topProducts, inventoryAlerts] = await Promise.all([
    fetchMetricsForDate(yesterday),
    fetchTopProducts(yesterday, yesterday, 5),
    fetchInventoryAlerts(),
  ]);

  const dailyMetrics = {
    date: yesterday,
    revenue: yesterdayMetrics.revenue,
    orders: yesterdayMetrics.orders,
    customers: yesterdayMetrics.customers,
    avgOrderValue: yesterdayMetrics.avgOrderValue,
    newCustomers: yesterdayMetrics.newCustomers,
    topProducts,
    inventoryAlerts: inventoryAlerts.slice(0, 5),
  };

  const prompt = DAILY_INSIGHT_PROMPT(dailyMetrics);
  
  let insight: DailyInsight;
  try {
    insight = await callLLMWithJSON<DailyInsight>(prompt, {
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0.6,
      max_tokens: 2500,
    });
  } catch (error: any) {
    console.error('LLM generation failed, using fallback:', error.message);
    insight = generateFallbackInsight(yesterday, yesterdayMetrics, topProducts, inventoryAlerts);
  }

  const insightId = uuid();
  await Promise.all([
    pool.query(
      `INSERT INTO insights_cache (id, insight_type, period_key, response, data_used, generated_at)
       VALUES ($1, 'daily', $2, $3, $4, NOW())
       ON CONFLICT (insight_type, period_key) DO UPDATE SET
         response = EXCLUDED.response,
         data_used = EXCLUDED.data_used,
         generated_at = NOW()`,
      [insightId, cacheKey, JSON.stringify(insight), JSON.stringify(dailyMetrics)]
    ),
    pool.query(
      `INSERT INTO insights_history (id, insight_type, period_key, period_start, period_end, recommendations, risks, opportunities, generated_at)
       VALUES ($1, 'daily', $2, $3, $4, $5, $6, $7, NOW())`,
      [
        insightId,
        cacheKey,
        yesterday,
        today,
        JSON.stringify(insight.actionables),
        JSON.stringify(insight.risks),
        JSON.stringify(insight.opportunities),
      ]
    ),
  ]);

  if (insight.actionables.length > 0) {
    const actionPromises = insight.actionables.map((action, idx) =>
      pool.query(
        `INSERT INTO action_items (id, insight_id, insight_type, description, priority, status, due_date, created_at)
         VALUES ($1, $2, 'daily', $3, $4, 'pending', $5, NOW())`,
        [
          `action_${insightId}_${idx}`,
          insightId,
          action.task,
          action.priority,
          today,
        ]
      )
    );
    await Promise.all(actionPromises);
  }

  await saveDailySnapshot({
    today: yesterdayMetrics,
    topProducts,
    inventoryAlerts,
  });

  return insight;
}

function generateFallbackInsight(
  date: string,
  metrics: { revenue: number; orders: number; customers: number; avgOrderValue: number },
  topProducts: Array<{ name: string; orders: number; revenue: number }>,
  inventoryAlerts: Array<{ product: string; stock: number; daysLeft: number }>
): DailyInsight {
  const criticalAlerts = inventoryAlerts.filter(a => a.daysLeft <= 5);
  
  return {
    date,
    yesterday_summary: `Generated ₹${(metrics.revenue / 100000).toFixed(2)}L from ${metrics.orders} orders with ₹${(metrics.avgOrderValue).toLocaleString('en-IN')} average order value.`,
    today_predictions: {
      expected_revenue: `₹${((metrics.revenue * 0.9) / 100000).toFixed(1)}-${((metrics.revenue * 1.1) / 100000).toFixed(1)}L`,
      expected_orders: `${Math.round(metrics.orders * 0.9)}-${Math.round(metrics.orders * 1.1)}`,
      confidence: metrics.orders > 50 ? 'high' : 'medium',
    },
    actionables: [
      ...(criticalAlerts.length > 0 ? [{
        priority: 'high' as const,
        task: `Restock ${criticalAlerts.map(a => a.product).join(', ')} - critical stock levels`,
        reason: 'Products at risk of stockout within 5 days',
        expected_impact: 'Prevent revenue loss of ₹' + (criticalAlerts.length * 50000).toLocaleString('en-IN'),
        deadline: 'urgent' as const,
      }] : []),
      {
        priority: 'medium' as const,
        task: `Focus on promoting ${topProducts[0]?.name || 'top products'}`,
        reason: 'Highest performing product driving revenue',
        expected_impact: `Maintain ${topProducts[0]?.orders || 0} daily orders`,
        deadline: 'today' as const,
      },
    ],
    risks: [
      {
        risk: inventoryAlerts.length > 0 ? 'Inventory stockout risk' : 'No major risks identified',
        likelihood: inventoryAlerts.length > 5 ? 'high' : inventoryAlerts.length > 0 ? 'medium' : 'low' as const,
        mitigation: 'Monitor daily and expedite restocking',
      },
    ],
    opportunities: [
      {
        opportunity: metrics.orders > 50 ? 'Strong sales momentum - consider upselling' : 'Focus on conversion optimization',
        potential: metrics.orders > 50 ? '10-15% revenue increase' : '5-10% conversion improvement',
        action: metrics.orders > 50 ? 'Add product recommendations at checkout' : 'Review checkout flow for drop-offs',
      },
    ],
  };
}

export async function getCachedDailyInsight(): Promise<DailyInsight | null> {
  const today = new Date().toISOString().split('T')[0];
  const result = await pool.query(
    `SELECT response FROM insights_cache WHERE insight_type = 'daily' AND period_key = $1`,
    [today]
  );
  return result.rows[0]?.response || null;
}