import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(
    "SELECT * FROM testimonials WHERE is_featured = true ORDER BY created_at DESC"
  );

  return NextResponse.json(rows);
}