import { pool } from '@/lib/db';

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
}

export interface FetchedMetrics {
  today: {
    revenue: number;
    orders: number;
    customers: number;
    avgOrderValue: number;
    newCustomers: number;
  };
  yesterday: {
    revenue: number;
    orders: number;
    customers: number;
    avgOrderValue: number;
    newCustomers: number;
  };
  last7Days: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
    avgOrderValue: number;
  }>;
  last30Days: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
    avgOrderValue: number;
  }>;
  topProducts: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  inventoryAlerts: Array<{
    product: string;
    productId: string;
    stock: number;
    daysLeft: number;
    threshold: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    revenue: number;
    orders: number;
  }>;
}

export async function fetchMetricsForDate(date: string): Promise<{
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  newCustomers: number;
}> {
  const result = await pool.query(`
    SELECT 
      COALESCE(SUM(total_amount), 0) as revenue,
      COUNT(*) as orders,
      COUNT(DISTINCT customer_id) as customers,
      COALESCE(AVG(total_amount), 0) as avg_order_value
    FROM orders
    WHERE created_at::date = $1 AND status != 'CANCELLED'
  `, [date]);

  const newCustomersResult = await pool.query(`
    SELECT COUNT(*) as new_customers
    FROM customers
    WHERE created_at::date = $1
  `, [date]);

  const row = result.rows[0];
  return {
    revenue: parseFloat(row.revenue) || 0,
    orders: parseInt(row.orders) || 0,
    customers: parseInt(row.customers) || 0,
    avgOrderValue: parseFloat(row.avg_order_value) || 0,
    newCustomers: parseInt(newCustomersResult.rows[0]?.new_customers) || 0,
  };
}

export async function fetchTopProducts(startDate: string, endDate: string, limit = 5) {
  const result = await pool.query(`
    SELECT 
      p.name,
      COUNT(o.id) as orders,
      COALESCE(SUM(o.total_amount), 0) as revenue
    FROM products p
    LEFT JOIN orders o ON o.product_id = p.id 
      AND o.created_at::date BETWEEN $1 AND $2 
      AND o.status != 'CANCELLED'
    GROUP BY p.id, p.name
    ORDER BY orders DESC NULLS LAST
    LIMIT $3
  `, [startDate, endDate, limit]);

  return result.rows.map((r: any) => ({
    name: r.name,
    orders: parseInt(r.orders) || 0,
    revenue: parseFloat(r.revenue) || 0,
  }));
}

export async function fetchInventoryAlerts() {
  const result = await pool.query(`
    SELECT 
      p.id as product_id,
      p.name as product_name,
      p.stock_quantity,
      rs.threshold,
      COALESCE(
        NULLIF(p.stock_quantity, 0) / NULLIF(
          (SELECT COUNT(*)::numeric FROM orders o 
           WHERE o.product_id = p.id 
           AND o.created_at >= NOW() - INTERVAL '30 days') / 30
        , 0),
        999
      ) as days_left
    FROM products p
    LEFT JOIN reorder_settings rs ON rs.product_id = p.id
    WHERE p.status = 'ACTIVE' 
      AND (p.stock_quantity <= COALESCE(rs.threshold, 10) OR p.stock_quantity <= 10)
    ORDER BY p.stock_quantity ASC
  `);

  return result.rows.map((r: any) => ({
    product: r.product_name,
    productId: r.product_id,
    stock: parseInt(r.stock_quantity) || 0,
    daysLeft: Math.round(parseFloat(r.days_left)) || 999,
    threshold: parseInt(r.threshold) || 10,
  }));
}

export async function fetchCategoryPerformance(startDate: string, endDate: string) {
  const result = await pool.query(`
    SELECT 
      COALESCE(p.category, 'Other') as category,
      COALESCE(SUM(o.total_amount), 0) as revenue,
      COUNT(o.id) as orders
    FROM products p
    LEFT JOIN orders o ON o.product_id = p.id 
      AND o.created_at::date BETWEEN $1 AND $2 
      AND o.status != 'CANCELLED'
    GROUP BY p.category
    ORDER BY revenue DESC
  `, [startDate, endDate]);

  return result.rows.map((r: any) => ({
    category: r.category || 'Other',
    revenue: parseFloat(r.revenue) || 0,
    orders: parseInt(r.orders) || 0,
  }));
}

export async function fetchAllMetrics(): Promise<FetchedMetrics> {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const last7Start = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const last30Start = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const [todayMetrics, yesterdayMetrics, topProducts7d, topProducts30d, inventoryAlerts, categoryPerformance] = await Promise.all([
    fetchMetricsForDate(today),
    fetchMetricsForDate(yesterday),
    fetchTopProducts(last7Start, today, 5),
    fetchTopProducts(last30Start, today, 10),
    fetchInventoryAlerts(),
    fetchCategoryPerformance(last30Start, today),
  ]);

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const metrics = await fetchMetricsForDate(date);
    last7Days.push({
      date,
      ...metrics,
    });
  }

  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const metrics = await fetchMetricsForDate(date);
    last30Days.push({
      date,
      ...metrics,
    });
  }

  const last7DaysRevenue = last7Days.reduce((sum, d) => sum + d.revenue, 0);
  const last30DaysRevenue = last30Days.reduce((sum, d) => sum + d.revenue, 0);
  const last7DaysOrders = last7Days.reduce((sum, d) => sum + d.orders, 0);
  const last30DaysOrders = last30Days.reduce((sum, d) => sum + d.orders, 0);

  const topProductsWithGrowth = topProducts30d.map((p: any, idx: number) => ({
    ...p,
    growth: idx < topProducts7d.length ? 
      ((p.revenue - topProducts7d[idx]?.revenue || 0) / (topProducts7d[idx]?.revenue || 1)) * 100 : 0,
    share: (p.revenue / last30DaysRevenue) * 100,
  }));

  return {
    today: todayMetrics,
    yesterday: yesterdayMetrics,
    last7Days,
    last30Days,
    topProducts: topProductsWithGrowth,
    inventoryAlerts,
    categoryPerformance,
  };
}

export async function saveDailySnapshot(metrics: any) {
  const today = new Date().toISOString().split('T')[0];
  
  await pool.query(`
    INSERT INTO daily_metrics_snapshots (id, date, revenue, orders, customers, avg_order_value, top_products, inventory_alerts)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (date) DO UPDATE SET
      revenue = EXCLUDED.revenue,
      orders = EXCLUDED.orders,
      customers = EXCLUDED.customers,
      avg_order_value = EXCLUDED.avg_order_value,
      top_products = EXCLUDED.top_products,
      inventory_alerts = EXCLUDED.inventory_alerts
  `, [
    `snapshot_${today}`,
    today,
    metrics.today.revenue,
    metrics.today.orders,
    metrics.today.customers,
    metrics.today.avgOrderValue,
    JSON.stringify(metrics.topProducts.slice(0, 5)),
    JSON.stringify(metrics.inventoryAlerts),
  ]);
}