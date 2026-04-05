import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query = `SELECT * FROM automated_reports`;
    const params: any[] = [];

    if (type) {
      params.push(type);
      query += ` WHERE report_type = $${params.length}`;
    }

    query += ` ORDER BY generated_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);

    const reports = result.rows.map((row: any) => ({
      id: row.id,
      reportType: row.report_type,
      title: row.title,
      data: row.data,
      summary: row.summary,
      generatedAt: row.generated_at,
      sentAt: row.sent_at,
      status: row.status,
    }));

    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (err: any) {
    console.error("Reports list API error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}