import { callLLMWithJSON } from '../llm/analyst';
import { WEEKLY_INSIGHT_PROMPT, SYSTEM_PROMPT } from '../llm/prompts';
import { fetchMetricsForDate, fetchTopProducts, fetchInventoryAlerts } from './data-fetcher';
import { pool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export interface WeeklyInsight {
  week_start: string;
  week_end: string;
  weekly_summary: string;
  next_week_predictions: {
    revenue_estimate: string;
    growth_projection: string;
    peak_days: string[];
    confidence: 'high' | 'medium' | 'low';
  };
  actionables: Array<{
    priority: 'high' | 'medium' | 'low';
    task: string;
    timeline: string;
    reason: string;
    expected_impact: string;
  }>;
  inventory_actions: Array<{
    product: string;
    action: 'restock' | 'promote' | 'discontinue';
    urgency: 'immediate' | 'this week' | 'next week';
    quantity: string;
  }>;
  risks: Array<{
    risk: string;
    likelihood: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
  opportunities: Array<{
    opportunity: string;
    timeline: string;
    potential: string;
    action: string;
  }>;
}

export async function generateWeeklyInsight(force = false): Promise<WeeklyInsight> {
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 7);
  
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = today.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];
  const periodKey = `${startStr}_${endStr}`;

  if (!force) {
    const cached = await pool.query(
      `SELECT response FROM insights_cache WHERE insight_type = 'weekly' AND period_key = $1`,
      [periodKey]
    );
    if (cached.rows.length > 0) {
      return cached.rows[0].response;
    }
  }

  const dailyMetrics = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const metrics = await fetchMetricsForDate(date);
    dailyMetrics.push({
      date,
      ...metrics,
    });
  }

  const [topProducts, inventoryAlerts] = await Promise.all([
    fetchTopProducts(startStr, endStr, 10),
    fetchInventoryAlerts(),
  ]);

  const totalRevenue = dailyMetrics.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = dailyMetrics.reduce((sum, d) => sum + d.orders, 0);
  const totalCustomers = dailyMetrics.reduce((sum, d) => sum + d.customers, 0);
  const avgDailyRevenue = totalRevenue / 7;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayRevenue: Record<string, number> = {};
  dailyMetrics.forEach(d => {
    const day = dayNames[new Date(d.date).getDay()];
    dayRevenue[day] = (dayRevenue[day] || 0) + d.revenue;
  });
  const peakDays = Object.entries(dayRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([day]) => day);

  const weeklyMetrics = {
    startDate: startStr,
    endDate: endStr,
    dailyMetrics: dailyMetrics.map(d => ({
      ...d,
      topProducts: [],
      inventoryAlerts: [],
    })),
    totalRevenue,
    totalOrders,
    totalCustomers,
    avgDailyRevenue,
    topProducts: topProducts.map(p => ({ ...p, growth: 0 })),
    peakDays,
    inventoryAlerts: inventoryAlerts.slice(0, 5),
  };

  const prompt = WEEKLY_INSIGHT_PROMPT(weeklyMetrics);
  
  let insight: WeeklyInsight;
  try {
    insight = await callLLMWithJSON<WeeklyInsight>(prompt, {
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0.6,
      max_tokens: 3000,
    });
  } catch (error: any) {
    console.error('LLM generation failed, using fallback:', error.message);
    insight = generateFallbackWeeklyInsight(startStr, endStr, dailyMetrics, totalRevenue, totalOrders, topProducts, inventoryAlerts);
  }

  const insightId = uuid();
  await Promise.all([
    pool.query(
      `INSERT INTO insights_cache (id, insight_type, period_key, response, data_used, generated_at)
       VALUES ($1, 'weekly', $2, $3, $4, NOW())
       ON CONFLICT (insight_type, period_key) DO UPDATE SET
         response = EXCLUDED.response,
         data_used = EXCLUDED.data_used,
         generated_at = NOW()`,
      [insightId, periodKey, JSON.stringify(insight), JSON.stringify(weeklyMetrics)]
    ),
    pool.query(
      `INSERT INTO insights_history (id, insight_type, period_key, period_start, period_end, recommendations, risks, opportunities, generated_at)
       VALUES ($1, 'weekly', $2, $3, $4, $5, $6, $7, NOW())`,
      [
        insightId,
        periodKey,
        startStr,
        endStr,
        JSON.stringify(insight.actionables),
        JSON.stringify(insight.risks),
        JSON.stringify(insight.opportunities),
      ]
    ),
  ]);

  if (insight.actionables?.length > 0) {
    const actionPromises = insight.actionables.map((action, idx) =>
      pool.query(
        `INSERT INTO action_items (id, insight_id, insight_type, description, priority, status, due_date, created_at)
         VALUES ($1, $2, 'weekly', $3, $4, 'pending', $5, NOW())`,
        [
          `action_${insightId}_${idx}`,
          insightId,
          action.task,
          action.priority,
          weekEndStr,
        ]
      )
    );
    await Promise.all(actionPromises);
  }

  return insight;
}

function generateFallbackWeeklyInsight(
  startDate: string,
  endDate: string,
  dailyMetrics: Array<{ date: string; revenue: number; orders: number }>,
  totalRevenue: number,
  totalOrders: number,
  topProducts: Array<{ name: string; orders: number; revenue: number }>,
  inventoryAlerts: Array<{ product: string; stock: number; daysLeft: number }>
): WeeklyInsight {
  const avgRevenue = totalRevenue / 7;
  const predictedRevenue = avgRevenue * 7 * 1.1;

  return {
    week_start: startDate,
    week_end: endDate,
    weekly_summary: `This week's revenue was ₹${(totalRevenue / 100000).toFixed(2)}L from ${totalOrders} orders. Average daily revenue was ₹${(avgRevenue / 100000).toFixed(2)}L.`,
    next_week_predictions: {
      revenue_estimate: `₹${((predictedRevenue) / 100000).toFixed(1)}-${((predictedRevenue * 1.15) / 100000).toFixed(1)}L`,
      growth_projection: '+8-15%',
      peak_days: ['Saturday', 'Sunday'],
      confidence: 'medium',
    },
    actionables: [
      {
        priority: 'high',
        task: 'Review and act on inventory alerts',
        timeline: 'Day 1-2',
        reason: `${inventoryAlerts.filter(a => a.daysLeft <= 5).length} products at critical stock levels`,
        expected_impact: 'Prevent stockout and maintain sales continuity',
      },
      {
        priority: 'medium',
        task: `Promote top performer: ${topProducts[0]?.name || 'best product'}`,
        timeline: 'Day 3-4',
        reason: 'Highest revenue generator this week',
        expected_impact: '10-15% revenue increase from focused promotion',
      },
    ],
    inventory_actions: inventoryAlerts.slice(0, 3).map(a => ({
      product: a.product,
      action: 'restock' as const,
      urgency: a.daysLeft <= 3 ? 'immediate' as const : 'this week' as const,
      quantity: `${Math.max(50, a.stock * 3)} units`,
    })),
    risks: [
      {
        risk: inventoryAlerts.length > 3 ? 'Multiple products at stockout risk' : 'Low inventory risk',
        likelihood: inventoryAlerts.length > 5 ? 'high' : 'medium',
        mitigation: 'Prioritize restocking of critical items',
      },
    ],
    opportunities: [
      {
        opportunity: 'Weekend sales peak',
        timeline: 'Saturday-Sunday',
        potential: '20-30% higher revenue',
        action: 'Ensure inventory availability and run targeted promotions',
      },
    ],
  };
}

export async function getCachedWeeklyInsight(): Promise<WeeklyInsight | null> {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 7);
  
  const periodKey = `${startDate.toISOString().split('T')[0]}_${today.toISOString().split('T')[0]}`;
  
  const result = await pool.query(
    `SELECT response FROM insights_cache WHERE insight_type = 'weekly' AND period_key = $1`,
    [periodKey]
  );
  return result.rows[0]?.response || null;
}