import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM customers ${whereClause}`,
      params
    );

    const customersResult = await pool.query(
      `SELECT * FROM customers ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      customers: customersResult.rows.map((c: any) => ({
        id: c.id,
        email: c.email,
        phone: c.phone,
        firstName: c.first_name,
        lastName: c.last_name,
        fullName: c.full_name,
        avatarUrl: c.avatar,
        isVerified: true,
        isActive: c.is_active,
        customerType: c.customer_segment || 'RETAIL',
        walletBalance: 0,
        loyaltyPoints: c.total_orders * 10 || 0,
        totalOrders: c.total_orders || 0,
        totalSpent: parseFloat(c.total_spent) || 0,
        lastOrderDate: c.last_order_at,
        tags: c.tags || [],
        createdAt: c.created_at,
        lastLoginAt: null,
      })),
      total: parseInt(countResult.rows[0].total),
      page,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
    });
  } catch (err) {
    console.error("Customers API error:", err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}