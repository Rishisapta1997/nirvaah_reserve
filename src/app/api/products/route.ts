import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ACTIVE";

    const query =
      status === "ALL"
        ? "SELECT * FROM products ORDER BY created_at ASC"
        : "SELECT * FROM products WHERE status = $1 ORDER BY created_at ASC";

    const { rows } = await pool.query(
      query,
      status === "ALL" ? [] : [status]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      type,
      price,
      oldPrice,
      image,
      features,
      isCombo,
      category,
      status,
      bookingPrice, // ✅ NEW
    } = body;

    if (!name || !type || !price || !image) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const id = randomUUID();

    const featuresStr =
      typeof features === "string"
        ? features
        : JSON.stringify(features || []);

    const { rows } = await pool.query(
      `INSERT INTO products 
      (id, name, type, price, old_price, image, features, is_combo, category, status, booking_price)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        id,
        name,
        type,
        price,
        oldPrice || null,
        image,
        featuresStr,
        isCombo || false,
        category || "INDIVIDUAL",
        status || "ACTIVE",
        bookingPrice ?? 199, // ✅ fallback
      ]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}