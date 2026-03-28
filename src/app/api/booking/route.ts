// FILE: src/app/api/booking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  
  try {
    const body = await req.json();
    const { fullName, email, phone, address, city, pincode, productId, productName } = body;

    if (!fullName || !email || !phone || !productId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    // Use parameterized query with pg pool
    await client.query(`
      INSERT INTO pre_orders
        (id, product_id, product_name, full_name, email, phone, address, city, pincode,
         token_amount, token_paid, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      id, 
      productId, 
      productName || "", 
      fullName, 
      email, 
      phone,
      address || "", 
      city || "", 
      pincode || "", 
      199, 
      0, 
      'PENDING', 
      now, 
      now
    ]);

    const order = await client.query("SELECT * FROM pre_orders WHERE id = $1", [id]);
    const orderResult = order.rows[0];
    
    return NextResponse.json(normalizeOrder(orderResult), { status: 201 });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  } finally {
    client.release();
  }
}

function normalizeOrder(o: any) {
  return {
    ...o,
    fullName: o.full_name,
    tokenAmount: o.token_amount,
    tokenPaid: o.token_paid === 1,
    productId: o.product_id,
    productName: o.product_name,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}