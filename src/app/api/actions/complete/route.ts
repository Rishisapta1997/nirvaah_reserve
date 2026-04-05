import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionId, status } = body;

    if (!actionId) {
      return NextResponse.json(
        { success: false, error: "actionId is required" },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'dismissed'];
    const newStatus = status || 'completed';

    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Use: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    let query = `UPDATE action_items SET status = $1`;
    const params: any[] = [newStatus];

    if (newStatus === 'completed') {
      query += `, completed_at = NOW()`;
    }

    params.push(actionId);
    query += ` WHERE id = $${params.length}`;

    await pool.query(query, params);

    const result = await pool.query(
      `SELECT * FROM action_items WHERE id = $1`,
      [actionId]
    );

    return NextResponse.json({
      success: true,
      message: `Action marked as ${newStatus}`,
      action: result.rows[0],
    });
  } catch (err: any) {
    console.error("Action complete API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update action" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const actionId = searchParams.get("id");

    if (!actionId) {
      return NextResponse.json(
        { success: false, error: "Action ID is required" },
        { status: 400 }
      );
    }

    await pool.query(`DELETE FROM action_items WHERE id = $1`, [actionId]);

    return NextResponse.json({
      success: true,
      message: "Action deleted",
    });
  } catch (err: any) {
    console.error("Action delete API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete action" },
      { status: 500 }
    );
  }
}