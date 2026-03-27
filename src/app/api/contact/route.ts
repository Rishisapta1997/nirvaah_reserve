import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  const { rows } = await pool.query(
    "SELECT * FROM contact_offices WHERE is_active = true"
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO contacts (id, name, email, phone, subject, message)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        randomUUID(),
        body.name,
        body.email,
        body.phone,
        body.subject,
        body.message,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}