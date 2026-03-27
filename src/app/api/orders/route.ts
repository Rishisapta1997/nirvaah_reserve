import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const where = status === "ALL" ? "" : "WHERE o.status = $1";
    const values: any[] = status === "ALL" ? [] : [status];

    const { rows: orders } = await pool.query(
      `SELECT o.*, p.name as p_name, p.type as p_type, p.image as p_image
       FROM pre_orders o
       LEFT JOIN products p ON p.id = o.product_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      values
    );

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM pre_orders ${where}`,
      values
    );

    return NextResponse.json({
      orders: orders.map((o: any) => ({
        id: o.id,
        fullName: o.full_name,
        email: o.email,
        phone: o.phone,
        address: o.address,
        city: o.city,
        pincode: o.pincode,
        status: o.status,
        tokenAmount: o.token_amount,
        tokenPaid: o.token_paid,
        trackingId: o.tracking_id,
        shippingPartner: o.shipping_partner,
        productId: o.product_id,
        productName: o.product_name,
        createdAt: o.created_at,
        product: o.p_name ? { name: o.p_name, type: o.p_type, image: o.p_image } : null,
      })),
      total: parseInt(countRows[0].count),
      page,
    });
  } catch (err) {
    console.error("Orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}