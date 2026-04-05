import { callLLMWithJSON } from '../llm/analyst';
import { MONTHLY_INSIGHT_PROMPT, SYSTEM_PROMPT } from '../llm/prompts';
import { fetchMetricsForDate, fetchTopProducts, fetchInventoryAlerts, fetchCategoryPerformance } from './data-fetcher';
import { pool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export interface MonthlyInsight {
  month: string;
  period: string;
  monthly_summary: string;
  growth_strategy: {
    revenue_target: string;
    growth_rate: string;
    key_levers: string[];
  };
  actionables: Array<{
    priority: 'high' | 'medium' | 'low';
    category: 'operations' | 'marketing' | 'inventory' | 'customer' | 'financial';
    task: string;
    timeline: 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4';
    investment: string;
    expected_roi: string;
    success_metric: string;
  }>;
  inventory_strategy: Array<{
    product: string;
    current_stock: number;
    action: string;
    timing: 'immediate' | 'this week' | 'this month';
    investment: string;
  }>;
  marketing_recommendations: Array<{
    channel: string;
    budget_allocation: string;
    strategy: string;
    expected_roi: string;
  }>;
  risks: Array<{
    risk: string;
    likelihood: 'high' | 'medium' | 'low';
    impact: string;
    mitigation: string;
  }>;
  opportunities: Array<{
    opportunity: string;
    timing: string;
    potential: string;
    investment: string;
    action_plan: string;
  }>;
}

export async function generateMonthlyInsight(force = false): Promise<MonthlyInsight> {
  const today = new Date();
  const monthStart = new Date(today);
  monthStart.setDate(1);
  
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
  
  const startStr = monthStart.toISOString().split('T')[0];
  const endStr = today.toISOString().split('T')[0];
  const periodKey = `${startStr}_${endStr}`;

  if (!force) {
    const cached = await pool.query(
      `SELECT response FROM insights_cache WHERE insight_type = 'monthly' AND period_key = $1`,
      [periodKey]
    );
    if (cached.rows.length > 0) {
      return cached.rows[0].response;
    }
  }

  const dailyMetrics = [];
  const currentDate = new Date(monthStart);
  while (currentDate <= today) {
    const date = currentDate.toISOString().split('T')[0];
    const metrics = await fetchMetricsForDate(date);
    dailyMetrics.push({
      date,
      ...metrics,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const [topProducts, inventoryAlerts, categoryPerformance, prevMonthRevenue, prevMonthOrders] = await Promise.all([
    fetchTopProducts(startStr, endStr, 10),
    fetchInventoryAlerts(),
    fetchCategoryPerformance(startStr, endStr),
    fetchMonthRevenue(prevMonthStart.toISOString().split('T')[0], new Date(monthStart.getTime() - 1).toISOString().split('T')[0]),
    fetchMonthOrders(prevMonthStart.toISOString().split('T')[0], new Date(monthStart.getTime() - 1).toISOString().split('T')[0]),
  ]);

  const totalRevenue = dailyMetrics.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = dailyMetrics.reduce((sum, d) => sum + d.orders, 0);
  const totalCustomers = dailyMetrics.reduce((sum, d) => sum + d.customers, 0);
  const avgDailyRevenue = totalRevenue / Math.max(dailyMetrics.length, 1);

  const revenueGrowth = prevMonthRevenue > 0 ? ((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;
  const orderGrowth = prevMonthOrders > 0 ? ((totalOrders - prevMonthOrders) / prevMonthOrders) * 100 : 0;

  const monthlyMetrics = {
    startDate: startStr,
    endDate: endStr,
    weeklyMetrics: [],
    totalRevenue,
    totalOrders,
    totalCustomers,
    avgDailyRevenue,
    revenueGrowth,
    orderGrowth,
    topProducts: topProducts.map(p => ({ 
      name: p.name, 
      orders: p.orders, 
      revenue: p.revenue, 
      share: (p.revenue / totalRevenue) * 100 
    })),
    categoryPerformance,
    inventoryAlerts: inventoryAlerts.slice(0, 5).map(a => ({
      product: a.product,
      stock: a.stock,
      critical: a.daysLeft <= 5,
    })),
  };

  const prompt = MONTHLY_INSIGHT_PROMPT(monthlyMetrics);
  
  let insight: MonthlyInsight;
  try {
    insight = await callLLMWithJSON<MonthlyInsight>(prompt, {
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0.6,
      max_tokens: 3500,
    });
  } catch (error: any) {
    console.error('LLM generation failed, using fallback:', error.message);
    insight = generateFallbackMonthlyInsight(
      startStr, 
      endStr, 
      totalRevenue, 
      totalOrders, 
      totalCustomers, 
      revenueGrowth, 
      topProducts.map(p => ({ name: p.name, orders: p.orders, revenue: p.revenue, share: (p.revenue / totalRevenue) * 100 })), 
      inventoryAlerts, 
      categoryPerformance
    );
  }

  const insightId = uuid();
  const nextMonthEnd = new Date(today);
  nextMonthEnd.setDate(nextMonthEnd.getDate() + 30);
  
  await Promise.all([
    pool.query(
      `INSERT INTO insights_cache (id, insight_type, period_key, response, data_used, generated_at)
       VALUES ($1, 'monthly', $2, $3, $4, NOW())
       ON CONFLICT (insight_type, period_key) DO UPDATE SET
         response = EXCLUDED.response,
         data_used = EXCLUDED.data_used,
         generated_at = NOW()`,
      [insightId, periodKey, JSON.stringify(insight), JSON.stringify(monthlyMetrics)]
    ),
    pool.query(
      `INSERT INTO insights_history (id, insight_type, period_key, period_start, period_end, recommendations, risks, opportunities, generated_at)
       VALUES ($1, 'monthly', $2, $3, $4, $5, $6, $7, NOW())`,
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
         VALUES ($1, $2, 'monthly', $3, $4, 'pending', $5, NOW())`,
        [
          `action_${insightId}_${idx}`,
          insightId,
          action.task,
          action.priority,
          nextMonthEnd.toISOString().split('T')[0],
        ]
      )
    );
    await Promise.all(actionPromises);
  }

  return insight;
}

async function fetchMonthRevenue(startDate: string, endDate: string): Promise<number> {
  const result = await pool.query(
    `SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE created_at::date BETWEEN $1 AND $2 AND status != 'CANCELLED'`,
    [startDate, endDate]
  );
  return parseFloat(result.rows[0]?.revenue) || 0;
}

async function fetchMonthOrders(startDate: string, endDate: string): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*) as orders FROM orders WHERE created_at::date BETWEEN $1 AND $2 AND status != 'CANCELLED'`,
    [startDate, endDate]
  );
  return parseInt(result.rows[0]?.orders) || 0;
}

function generateFallbackMonthlyInsight(
  startDate: string,
  endDate: string,
  totalRevenue: number,
  totalOrders: number,
  totalCustomers: number,
  revenueGrowth: number,
  topProducts: Array<{ name: string; orders: number; revenue: number; share: number }>,
  inventoryAlerts: Array<{ product: string; stock: number; daysLeft: number }>,
  categoryPerformance: Array<{ category: string; revenue: number; orders: number }>
): MonthlyInsight {
  const targetRevenue = totalRevenue * (1 + (revenueGrowth > 0 ? revenueGrowth : 10) / 100);

  return {
    month: startDate.split('-')[1],
    period: `${startDate} to ${endDate}`,
    monthly_summary: `This month's revenue reached ₹${(totalRevenue / 100000).toFixed(2)}L from ${totalOrders} orders by ${totalCustomers} customers. Growth was ${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% vs previous month.`,
    growth_strategy: {
      revenue_target: `₹${(targetRevenue / 100000).toFixed(1)}L next month`,
      growth_rate: `${revenueGrowth > 0 ? revenueGrowth : 10}% target`,
      key_levers: ['Inventory optimization', 'Weekend promotions', 'Top product focus'],
    },
    actionables: [
      {
        priority: 'high',
        category: 'inventory',
        task: 'Address critical stock alerts',
        timeline: 'Week 1',
        investment: '₹2-5 lakhs',
        expected_roi: 'Prevent revenue loss',
        success_metric: 'All critical items restocked',
      },
      {
        priority: 'high',
        category: 'marketing',
        task: 'Double down on top performing products',
        timeline: 'Week 2',
        investment: '₹50,000-1 lakh',
        expected_roi: '15-20% revenue increase',
        success_metric: 'Top 3 products 20% growth',
      },
      {
        priority: 'medium',
        category: 'customer',
        task: 'Implement customer retention program',
        timeline: 'Week 3',
        investment: '₹25,000',
        expected_roi: '10% repeat customers',
        success_metric: 'LTV increase by 15%',
      },
      {
        priority: 'medium',
        category: 'operations',
        task: 'Optimize fulfillment process',
        timeline: 'Week 4',
        investment: 'Minimal',
        expected_roi: 'Faster delivery, happier customers',
        success_metric: 'Delivery time reduced by 20%',
      },
    ],
    inventory_strategy: inventoryAlerts.slice(0, 5).map(a => ({
      product: a.product,
      current_stock: a.stock,
      action: `Restock ${Math.max(50, a.stock * 3)} units`,
      timing: a.daysLeft <= 3 ? 'immediate' as const : 'this month' as const,
      investment: `₹${(Math.max(50, a.stock * 3) * 2000).toLocaleString('en-IN')}`,
    })),
    marketing_recommendations: [
      {
        channel: 'Instagram',
        budget_allocation: '40%',
        strategy: 'Showcase product craftsmanship, user reviews',
        expected_roi: '3-4x',
      },
      {
        channel: 'Google Ads',
        budget_allocation: '35%',
        strategy: 'Target high-intent leather bag keywords',
        expected_roi: '2-3x',
      },
      {
        channel: 'Email',
        budget_allocation: '25%',
        strategy: 'Personalized product recommendations',
        expected_roi: '4-5x',
      },
    ],
    risks: [
      {
        risk: 'Inventory stockouts affecting sales',
        likelihood: inventoryAlerts.length > 3 ? 'high' : 'medium',
        impact: '₹5-10 lakhs potential revenue loss',
        mitigation: 'Expedite restocking, maintain safety stock',
      },
      {
        risk: 'Seasonal demand fluctuation',
        likelihood: 'medium',
        impact: '20-30% revenue variation',
        mitigation: 'Plan promotions around peak days',
      },
    ],
    opportunities: [
      {
        opportunity: 'Wedding season / Festival demand',
        timing: 'Next 30 days',
        potential: '₹15-20 lakhs additional revenue',
        investment: '₹1-2 lakhs marketing',
        action_plan: 'Run festival-specific campaigns, gift packaging',
      },
      {
        opportunity: 'Repeat customer upselling',
        timing: 'Ongoing',
        potential: '₹5-8 lakhs revenue',
        investment: '₹25,000 CRM tools',
        action_plan: 'Personalized recommendations, loyalty program',
      },
    ],
  };
}

export async function getCachedMonthlyInsight(): Promise<MonthlyInsight | null> {
  const today = new Date();
  const monthStart = new Date(today);
  monthStart.setDate(1);
  
  const periodKey = `${monthStart.toISOString().split('T')[0]}_${today.toISOString().split('T')[0]}`;
  
  const result = await pool.query(
    `SELECT response FROM insights_cache WHERE insight_type = 'monthly' AND period_key = $1`,
    [periodKey]
  );
  return result.rows[0]?.response || null;
}