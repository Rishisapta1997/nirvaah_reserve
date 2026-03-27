import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = parseInt(searchParams.get("range") || "30");
    const since = `NOW() - INTERVAL '${range} days'`;

    const [
      pvRes, clRes, inRes, coRes,
      revRes, paidRes, totalRes,
      compRes, topProdRes, statusRes,
      trendRes, recentRes,
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM analytics_events WHERE event_type='PAGE_VIEW' AND created_at >= ${since}`),
      pool.query(`SELECT COUNT(*) FROM analytics_events WHERE event_type='CLICK' AND created_at >= ${since}`),
      pool.query(`SELECT COUNT(*) FROM analytics_events WHERE event_type='INTENT_BOOK' AND created_at >= ${since}`),
      pool.query(`SELECT COUNT(*) FROM analytics_events WHERE event_type='CONVERSION' AND created_at >= ${since}`),
      pool.query(`SELECT COALESCE(SUM(token_amount), 0) as total FROM pre_orders WHERE token_paid = true`),
      pool.query(`SELECT COUNT(*) FROM pre_orders WHERE token_paid = true`),
      pool.query(`SELECT COUNT(*) FROM pre_orders`),
      pool.query(`
        SELECT component_id, COUNT(*) as count
        FROM analytics_events
        WHERE event_type='CLICK' AND component_id IS NOT NULL AND created_at >= ${since}
        GROUP BY component_id ORDER BY count DESC LIMIT 10
      `),
      pool.query(`
        SELECT product_id, product_name, COUNT(*) as count
        FROM pre_orders
        GROUP BY product_id, product_name ORDER BY count DESC LIMIT 10
      `),
      pool.query(`SELECT status, COUNT(*) as count FROM pre_orders GROUP BY status`),
      pool.query(`
        SELECT
          DATE(created_at) as date,
          SUM(CASE WHEN event_type='PAGE_VIEW' THEN 1 ELSE 0 END) as "pageViews",
          SUM(CASE WHEN event_type='CLICK' THEN 1 ELSE 0 END) as clicks,
          SUM(CASE WHEN event_type='INTENT_BOOK' THEN 1 ELSE 0 END) as intents,
          SUM(CASE WHEN event_type='CONVERSION' THEN 1 ELSE 0 END) as conversions
        FROM analytics_events WHERE created_at >= ${since}
        GROUP BY DATE(created_at) ORDER BY date ASC
      `),
      pool.query(`
        SELECT o.*, p.name as p_name, p.type as p_type, p.image as p_image
        FROM pre_orders o
        LEFT JOIN products p ON p.id = o.product_id
        ORDER BY o.created_at DESC LIMIT 5
      `),
    ]);

    const tv = parseInt(pvRes.rows[0].count);
    const tc = parseInt(clRes.rows[0].count);
    const ti = parseInt(inRes.rows[0].count);
    const tconv = parseInt(coRes.rows[0].count);

    return NextResponse.json({
      overview: {
        totalPageViews: tv,
        totalClicks: tc,
        totalIntents: ti,
        totalConversions: tconv,
        conversionRate: tv > 0 ? ((tconv / tv) * 100).toFixed(1) + "%" : "0%",
        clickToIntentRate: tc > 0 ? ((ti / tc) * 100).toFixed(1) + "%" : "0%",
        totalRevenue: parseFloat(revRes.rows[0].total),
        paidOrders: parseInt(paidRes.rows[0].count),
        totalOrders: parseInt(totalRes.rows[0].count),
      },
      clicksByComponent: compRes.rows.map((r: any) => ({
        componentId: r.component_id,
        _count: { componentId: parseInt(r.count) },
      })),
      topProducts: topProdRes.rows.map((r: any) => ({
        productId: r.product_id,
        productName: r.product_name,
        _count: { _all: parseInt(r.count) },
      })),
      ordersByStatus: statusRes.rows.map((r: any) => ({
        status: r.status,
        _count: { _all: parseInt(r.count) },
      })),
      dailyTrend: trendRes.rows.map((r: any) => ({
        date: r.date,
        pageViews: parseInt(r.pageViews) || 0,
        clicks: parseInt(r.clicks) || 0,
        intents: parseInt(r.intents) || 0,
        conversions: parseInt(r.conversions) || 0,
      })),
      recentOrders: recentRes.rows.map((o: any) => ({
        id: o.id,
        fullName: o.full_name,
        email: o.email,
        city: o.city,
        status: o.status,
        tokenAmount: o.token_amount,
        tokenPaid: o.token_paid,
        productId: o.product_id,
        productName: o.product_name,
        createdAt: o.created_at,
        product: o.p_name ? { name: o.p_name, type: o.p_type, image: o.p_image } : null,
      })),
    });
  } catch (err) {
    console.error("Analytics dashboard error:", err);
    return NextResponse.json({ error: "Analytics failed" }, { status: 500 });
  }
}