import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = parseInt(searchParams.get("range") || "30");
    const since = `NOW() - INTERVAL '${range} days'`;

    // Overall stats
    const overviewResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT id) as total_sessions,
        COUNT(DISTINCT customer_id) as unique_visitors,
        SUM(page_views) as total_page_views,
        AVG(bounce_rate) as avg_bounce_rate,
        AVG(avg_session_duration) as avg_session_duration
      FROM analytics_daily
      WHERE date >= ${since}
    `);

    // Traffic sources
    const sourcesResult = await pool.query(`
      SELECT sources->>'direct' as direct,
             sources->>'google' as google,
             sources->>'instagram' as instagram,
             sources->>'facebook' as facebook,
             sources->>'other' as other
      FROM analytics_daily
      WHERE date >= ${since}
      ORDER BY date DESC
      LIMIT 1
    `);

    // Daily traffic
    const dailyTrafficResult = await pool.query(`
      SELECT date, sessions, unique_visitors, page_views, bounce_rate
      FROM analytics_daily
      WHERE date >= ${since}
      ORDER BY date ASC
    `);

    // Device breakdown
    const deviceResult = await pool.query(`
      SELECT device_type, COUNT(*) as count
      FROM analytics_sessions
      WHERE created_at >= ${since}
      GROUP BY device_type
    `);

    // Top pages
    const topPagesResult = await pool.query(`
      SELECT landing_page as page, COUNT(*) as views, AVG(duration_seconds) as avg_duration
      FROM analytics_sessions
      WHERE created_at >= ${since} AND landing_page IS NOT NULL
      GROUP BY landing_page
      ORDER BY views DESC
      LIMIT 10
    `);

    // Conversion funnel
    const funnelResult = await pool.query(`
      SELECT 
        SUM(sessions) as sessions,
        SUM(products_viewed) as product_views,
        SUM(add_to_cart_count) as cart_adds,
        SUM(checkout_started) as checkouts,
        SUM(orders_count) as orders
      FROM analytics_daily
      WHERE date >= ${since}
    `);

    // Geographic
    const geoResult = await pool.query(`
      SELECT country, city, COUNT(*) as sessions
      FROM analytics_sessions
      WHERE created_at >= ${since}
      GROUP BY country, city
      ORDER BY sessions DESC
      LIMIT 10
    `);

    const overview = overviewResult.rows[0];
    const funnel = funnelResult.rows[0];

    return NextResponse.json({
      overview: {
        totalSessions: parseInt(overview.total_sessions) || 0,
        uniqueVisitors: parseInt(overview.unique_visitors) || 0,
        pageViews: parseInt(overview.total_page_views) || 0,
        bounceRate: parseFloat(overview.avg_bounce_rate) || 0,
        avgSessionDuration: parseInt(overview.avg_session_duration) || 0,
      },
      sources: sourcesResult.rows[0] || { direct: 30, google: 25, instagram: 20, facebook: 15, other: 10 },
      dailyTraffic: dailyTrafficResult.rows.map((d: any) => ({
        date: d.date,
        sessions: parseInt(d.sessions),
        visitors: parseInt(d.unique_visitors),
        pageViews: parseInt(d.page_views),
        bounceRate: parseFloat(d.bounce_rate),
      })),
      devices: deviceResult.rows.map((d: any) => ({
        type: d.device_type,
        count: parseInt(d.count),
      })),
      topPages: topPagesResult.rows.map((p: any) => ({
        page: p.page,
        views: parseInt(p.views),
        avgDuration: parseInt(p.avg_duration),
      })),
      funnel: {
        sessions: parseInt(funnel.sessions) || 0,
        productViews: parseInt(funnel.product_views) || 0,
        cartAdds: parseInt(funnel.cart_adds) || 0,
        checkouts: parseInt(funnel.checkouts) || 0,
        orders: parseInt(funnel.orders) || 0,
        conversionRate: funnel.sessions > 0 ? ((parseInt(funnel.orders) / parseInt(funnel.sessions)) * 100).toFixed(2) : "0",
      },
      geography: geoResult.rows.map((g: any) => ({
        country: g.country,
        city: g.city,
        sessions: parseInt(g.sessions),
      })),
    });
  } catch (err) {
    console.error("Traffic analytics error:", err);
    return NextResponse.json({ error: "Failed to fetch traffic analytics" }, { status: 500 });
  }
}