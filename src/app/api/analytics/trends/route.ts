import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = parseInt(searchParams.get("range") || "30");
    const since = `NOW() - INTERVAL '${range} days'`;

    const [
      deviceRes,
      cityRes,
      referrerRes,
      timeRes
    ] = await Promise.all([
      // Device platform grouping
      pool.query(`
        SELECT COALESCE(device_type, 'Unknown') as device, COUNT(*) as count 
        FROM analytics_events 
        WHERE event_type='PAGE_VIEW' AND created_at >= ${since}
        GROUP BY device_type
      `),
      // Geographic mapping
      pool.query(`
        SELECT COALESCE(city, 'Unknown') as city, COUNT(*) as count 
        FROM analytics_events 
        WHERE event_type='CLICK' AND created_at >= ${since}
        GROUP BY city
        ORDER BY count DESC LIMIT 10
      `),
      // Source tracking
      pool.query(`
        SELECT COALESCE(referrer, 'Direct') as referrer, COUNT(*) as count 
        FROM analytics_events 
        WHERE event_type='PAGE_VIEW' AND created_at >= ${since}
        GROUP BY referrer
        ORDER BY count DESC LIMIT 10
      `),
      // Traffic Time of Day Tracker
      pool.query(`
        SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count
        FROM analytics_events
        WHERE created_at >= ${since}
        GROUP BY hour
        ORDER BY hour ASC
      `)
    ]);

    return NextResponse.json({
      devices: deviceRes.rows.map(r => ({ name: r.device, value: parseInt(r.count) })),
      cities: cityRes.rows.map(r => ({ name: r.city, value: parseInt(r.count) })),
      referrers: referrerRes.rows.map(r => ({ name: r.referrer, value: parseInt(r.count) })),
      hourly: timeRes.rows.map(r => ({ hour: parseInt(r.hour), value: parseInt(r.count) }))
    });
  } catch (err) {
    console.error("Trends analytics error:", err);
    return NextResponse.json({ error: "Trends failed" }, { status: 500 });
  }
}
