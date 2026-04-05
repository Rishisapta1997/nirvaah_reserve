// FILE: src/app/api/booking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";
import { sendOrderConfirmationEmail } from "@/lib/email/sender";

function generateOrderNumber(): string {
  return `NIR${Date.now().toString(36).toUpperCase().substring(0, 6)}${Math.floor(Math.random() * 9000) + 1000}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, address, city, pincode, productId, productName, productPrice } = body;

    if (!fullName || !email || !phone || !productId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = randomUUID();
    const orderNumber = generateOrderNumber();
    const now = new Date().toISOString();
    const tokenAmount = 199;

    // First, get or create customer
    let customerId: string | null = null;
    const customerCheck = await pool.query("SELECT id FROM customers WHERE email = $1", [email]);
    
    if (customerCheck.rows.length > 0) {
      customerId = customerCheck.rows[0].id;
      await pool.query(
        "UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + $1 WHERE id = $2",
        [parseFloat(productPrice) || 0, customerId]
      );
    } else {
      customerId = randomUUID();
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      await pool.query(`
        INSERT INTO customers (id, first_name, last_name, full_name, email, phone, total_orders, total_spent, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $8)
      `, [customerId, firstName, lastName, fullName, email, phone, parseFloat(productPrice) || 0, now]);
    }

    // Create order - match actual database columns
    const priceValue = String(productPrice || '0').replace(/[^0-9.]/g, '');
    const insertResult = await pool.query(`
      INSERT INTO orders (id, order_number, customer_id, product_id, product_name, full_name, email, phone, address, city, pincode, token_amount, total_amount, token_paid, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      id, 
      orderNumber,
      customerId,
      productId, 
      productName || "Nirvaah Product", 
      fullName, 
      email, 
      phone,
      address || "Address not provided", 
      city || "City not provided", 
      pincode || "000000", 
      tokenAmount, 
      parseFloat(priceValue) || 0,
      0, 
      'PENDING', 
      now, 
      now
    ]);

    const orderResult = insertResult.rows[0];

    // Send confirmation email to customer
    try {
      await sendOrderConfirmationEmail({
        orderNumber: orderResult.order_number,
        customerName: fullName,
        customerEmail: email,
        productName: productName || 'Nirvaah Product',
        productPrice: `₹${parseFloat(priceValue || '0').toLocaleString('en-IN')}`,
        tokenAmount: `₹${tokenAmount}`,
        totalAmount: `₹${parseFloat(priceValue || '0').toLocaleString('en-IN')}`,
        orderDate: new Date(now).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        deliveryEstimate: '5-7 business days',
      });
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr);
    }
    
    return NextResponse.json({
      ...normalizeOrder(orderResult),
      trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${orderNumber}`,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Booking error:", err.message);
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");

  if (!orderNumber) {
    return NextResponse.json({ error: "Order number required" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE order_number = $1",
      [orderNumber]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(normalizeOrder(result.rows[0]));
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}