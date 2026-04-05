import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = parseInt(searchParams.get("range") || "30");
    const since = `NOW() - INTERVAL '${range} days'`;

    const [
      utmRes,
      platformRes,
      funnelBrowserRes
    ] = await Promise.all([
      // UTM Campaigns & their conversions
      pool.query(`
        SELECT COALESCE(utm_campaign, 'Organic/Direct') as campaign,
               COUNT(CASE WHEN event_type = 'PAGE_VIEW' THEN 1 END) as views,
               COUNT(CASE WHEN event_type = 'CONVERSION' THEN 1 END) as conversions
        FROM analytics_events
        WHERE created_at >= ${since}
        GROUP BY utm_campaign
        ORDER BY views DESC LIMIT 10
      `),

      // Spend VS Returns per Platform
      pool.query(`
        SELECT m.platform, 
               COALESCE(SUM(m.spend_amount), 0) as spend,
               COALESCE(SUM(m.clicks), 0) as clicks
        FROM marketing_spend m
        WHERE m.date >= DATE(${since})
        GROUP BY m.platform
      `),

      // Browser Conversion Breakdowns
      pool.query(`
        SELECT COALESCE(browser, 'Unknown') as browser,
               COUNT(CASE WHEN event_type = 'PAGE_VIEW' THEN 1 END) as views,
               COUNT(CASE WHEN event_type = 'CONVERSION' THEN 1 END) as conversions
        FROM analytics_events
        WHERE created_at >= ${since}
        GROUP BY browser
        ORDER BY views DESC LIMIT 5
      `)
    ]);

    // To calculate ROAS perfectly per platform, we look at conversions tied to that utm_source.
    // As a simplification, we will return the spend side, and the frontend can correlate or we do it here.
    
    return NextResponse.json({
      campaigns: utmRes.rows.map(r => ({
        campaign: r.campaign,
        views: parseInt(r.views),
        conversions: parseInt(r.conversions),
        cvr: parseInt(r.views) > 0 ? ((parseInt(r.conversions) / parseInt(r.views)) * 100).toFixed(1) + "%" : "0%"
      })),
      platforms: platformRes.rows.map(r => ({
        platform: r.platform,
        spend: parseFloat(r.spend),
        clicks: parseInt(r.clicks),
        cpc: parseInt(r.clicks) > 0 ? (parseFloat(r.spend) / parseInt(r.clicks)).toFixed(2) : "0"
      })),
      browsers: funnelBrowserRes.rows.map(r => ({
        browser: r.browser,
        views: parseInt(r.views),
        conversions: parseInt(r.conversions),
        cvr: parseInt(r.views) > 0 ? ((parseInt(r.conversions) / parseInt(r.views)) * 100).toFixed(1) + "%" : "0%"
      }))
    });

  } catch (err) {
    console.error("Marketing analytics error:", err);
    return NextResponse.json({ error: "Failed to load marketing stats" }, { status: 500 });
  }
}
