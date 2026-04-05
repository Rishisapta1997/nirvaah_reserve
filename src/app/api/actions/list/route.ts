import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const insightType = searchParams.get("insight_type");

    let query = `
      SELECT 
        ai.id,
        ai.insight_id,
        ai.insight_type,
        ai.description,
        ai.category,
        ai.priority,
        ai.status,
        ai.due_date,
        ai.completed_at,
        ai.created_at,
        ih.generated_at as insight_generated
      FROM action_items ai
      LEFT JOIN insights_history ih ON ih.id = ai.insight_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND ai.status = $${params.length}`;
    }

    if (priority) {
      params.push(priority);
      query += ` AND ai.priority = $${params.length}`;
    }

    if (insightType) {
      params.push(insightType);
      query += ` AND ai.insight_type = $${params.length}`;
    }

    query += ` ORDER BY 
      CASE ai.priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
      END,
      ai.created_at DESC`;

    const result = await pool.query(query, params);

    const actions = result.rows.map((row: any) => ({
      id: row.id,
      insightId: row.insight_id,
      insightType: row.insight_type,
      description: row.description,
      category: row.category,
      priority: row.priority,
      status: row.status,
      dueDate: row.due_date,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      insightGenerated: row.insight_generated,
    }));

    const stats = await pool.query(`
      SELECT 
        status,
        priority,
        COUNT(*) as count
      FROM action_items
      GROUP BY status, priority
    `);

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    stats.rows.forEach((row: any) => {
      byStatus[row.status] = (byStatus[row.status] || 0) + parseInt(row.count);
      byPriority[row.priority] = (byPriority[row.priority] || 0) + parseInt(row.count);
    });

    return NextResponse.json({
      success: true,
      actions,
      stats: {
        byStatus,
        byPriority,
        total: actions.length,
      },
    });
  } catch (err: any) {
    console.error("Actions list API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch actions" },
      { status: 500 }
    );
  }
}