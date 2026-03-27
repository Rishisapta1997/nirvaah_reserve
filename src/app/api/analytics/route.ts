import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { eventType, path, componentId, sessionId, deviceInfo, metadata } = await req.json();

    if (!eventType || !path) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO analytics_events (id, event_type, path, component_id, session_id, device_info, metadata)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6)`,
      [eventType, path, componentId || null, sessionId || null,
       deviceInfo || null, metadata ? JSON.stringify(metadata) : null]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Analytics insert error:", err);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}