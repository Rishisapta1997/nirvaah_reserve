import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== "ALL") {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (product_name ILIKE $${paramIndex} OR full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM orders ${whereClause}`,
      params
    );

    const ordersResult = await pool.query(
      `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const orders = ordersResult.rows.map((o: any) => ({
      id: o.id,
      orderNumber: o.id?.substring(0, 10).toUpperCase() || 'NIR0001',
      customerId: o.customer_id,
      customerName: o.full_name,
      customerEmail: o.email,
      customerPhone: o.phone,
      orderType: o.order_type || 'PREORDER',
      source: 'WEBSITE',
      status: o.status,
      paymentStatus: o.payment_status || (o.token_paid ? 'PAID' : 'PENDING'),
      fulfillmentStatus: o.status === 'DELIVERED' ? 'FULFILLED' : 'UNFULFILLED',
      subtotal: parseFloat(o.total_amount) - (parseFloat(o.tax_amount) || 0) - (parseFloat(o.shipping_cost) || 0),
      discountTotal: parseFloat(o.discount_amount) || 0,
      taxAmount: parseFloat(o.tax_amount) || 0,
      shippingCost: parseFloat(o.shipping_cost) || 0,
      total: parseFloat(o.total_amount) || 0,
      tokenAmount: parseFloat(o.token_amount) || 199,
      tokenPaid: o.token_paid,
      balanceAmount: (parseFloat(o.total_amount) || 0) - (parseFloat(o.token_amount) || 199),
      balancePaid: o.payment_status === 'PAID',
      totalPaid: o.token_paid ? parseFloat(o.token_amount) : 0,
      trackingNumber: o.tracking_id,
      shippingPartner: o.shipping_partner,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      items: [{
        id: o.id,
        productId: o.product_id,
        productName: o.product_name,
        quantity: 1,
        unitPrice: parseFloat(o.total_amount) || 0,
        total: parseFloat(o.total_amount) || 0,
      }],
    }));

    return NextResponse.json({
      orders,
      total: parseInt(countResult.rows[0].total),
      page,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
    });
  } catch (err) {
    console.error("Orders API error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}