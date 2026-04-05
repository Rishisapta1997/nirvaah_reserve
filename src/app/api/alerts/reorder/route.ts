import { NextRequest, NextResponse } from "next/server";
import { fetchInventoryAlerts } from "@/lib/insights/data-fetcher";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = `
      SELECT 
        ra.id,
        ra.product_id,
        ra.product_name,
        ra.current_stock,
        ra.threshold,
        ra.predicted_days_left,
        ra.status,
        ra.alert_type,
        ra.created_at,
        ra.acknowledged_at,
        ra.resolved_at
      FROM reorder_alerts ra
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND ra.status = $${params.length}`;
    }

    query += ` ORDER BY ra.created_at DESC`;

    const result = await pool.query(query, params);

    const alerts = result.rows.map((row: any) => ({
      id: row.id,
      productId: row.product_id,
      productName: row.product_name,
      currentStock: parseInt(row.current_stock),
      threshold: parseInt(row.threshold),
      predictedDaysLeft: parseInt(row.predicted_days_left),
      status: row.status,
      alertType: row.alert_type,
      createdAt: row.created_at,
      acknowledgedAt: row.acknowledged_at,
      resolvedAt: row.resolved_at,
    }));

    const liveAlerts = await fetchInventoryAlerts();

    return NextResponse.json({
      success: true,
      alerts,
      liveAlerts,
    });
  } catch (err: any) {
    console.error("Reorder alerts API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch reorder alerts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, alertId } = body;

    if (action === 'acknowledge' && alertId) {
      await pool.query(
        `UPDATE reorder_alerts SET status = 'acknowledged', acknowledged_at = NOW() WHERE id = $1`,
        [alertId]
      );
      return NextResponse.json({ success: true, message: 'Alert acknowledged' });
    }

    if (action === 'resolve' && alertId) {
      await pool.query(
        `UPDATE reorder_alerts SET status = 'resolved', resolved_at = NOW() WHERE id = $1`,
        [alertId]
      );
      return NextResponse.json({ success: true, message: 'Alert resolved' });
    }

    if (action === 'dismiss' && alertId) {
      await pool.query(
        `UPDATE reorder_alerts SET status = 'dismissed' WHERE id = $1`,
        [alertId]
      );
      return NextResponse.json({ success: true, message: 'Alert dismissed' });
    }

    const liveAlerts = await fetchInventoryAlerts();

    const newAlerts = [];
    for (const alert of liveAlerts) {
      const existing = await pool.query(
        `SELECT id FROM reorder_alerts WHERE product_id = $1 AND status = 'pending'`,
        [alert.productId]
      );

      if (existing.rows.length === 0) {
        const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await pool.query(
          `INSERT INTO reorder_alerts (id, product_id, product_name, current_stock, threshold, predicted_days_left, status, alert_type)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)`,
          [alertId, alert.productId, alert.product, alert.stock, alert.threshold, alert.daysLeft, alert.daysLeft <= 5 ? 'depletion_warning' : 'low_stock']
        );
        newAlerts.push(alert);
      }
    }

    return NextResponse.json({
      success: true,
      message: newAlerts.length > 0 ? `Created ${newAlerts.length} new alerts` : 'No new alerts',
      newAlerts,
    });
  } catch (err: any) {
    console.error("Reorder alerts API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process reorder alert" },
      { status: 500 }
    );
  }
}