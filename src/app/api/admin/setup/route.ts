import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    await pool.query(`
      INSERT INTO admin_users (id, email, password, name, role)
      VALUES (gen_random_uuid()::text, 'admin@nirvaah.com', 'admin123', 'Admin', 'ADMIN')
      ON CONFLICT (email) DO NOTHING
    `);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}