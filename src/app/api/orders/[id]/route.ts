import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: any) {
  const { rows } = await pool.query(
    `SELECT o.*, p.name as p_name, p.type as p_type, p.image as p_image
     FROM pre_orders o LEFT JOIN products p ON p.id = o.product_id
     WHERE o.id = $1`,
    [params.id]
  );
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const o = rows[0];
  return NextResponse.json({
    id: o.id, fullName: o.full_name, email: o.email, phone: o.phone,
    address: o.address, city: o.city, pincode: o.pincode, status: o.status,
    tokenAmount: o.token_amount, tokenPaid: o.token_paid,
    trackingId: o.tracking_id, shippingPartner: o.shipping_partner,
    productId: o.product_id, productName: o.product_name, createdAt: o.created_at,
    product: o.p_name ? { name: o.p_name, type: o.p_type, image: o.p_image } : null,
  });
}

export async function PATCH(req: NextRequest, { params }: any) {
  try {
    const body = await req.json();
    const allowed: Record<string, string> = {
      status: "status",
      trackingId: "tracking_id",
      shippingPartner: "shipping_partner",
      tokenPaid: "token_paid",
      paymentReference: "payment_reference",
    };

    const sets: string[] = ["updated_at = NOW()"];
    const vals: any[] = [];
    let i = 1;

    for (const [key, col] of Object.entries(allowed)) {
      if (key in body) { sets.push(`${col} = $${i++}`); vals.push(body[key]); }
    }

    vals.push(params.id);
    const { rows } = await pool.query(
      `UPDATE pre_orders SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
      vals
    );
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("PATCH orders error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}