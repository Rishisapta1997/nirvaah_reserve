// FILE: src/app/api/booking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, address, city, pincode, productId, productName } = body;

    if (!fullName || !email || !phone || !productId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();
    const id = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO pre_orders
        (id, product_id, product_name, full_name, email, phone, address, city, pincode,
         token_amount, token_paid, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 199, 0, 'PENDING', ?, ?)
    `).run(id, productId, productName || "", fullName, email, phone,
           address || "", city || "", pincode || "", now, now);

    const order = db.prepare("SELECT * FROM pre_orders WHERE id = ?").get(id) as any;
    return NextResponse.json(normalizeOrder(order), { status: 201 });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
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