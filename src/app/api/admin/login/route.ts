import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const { rows } = await pool.query(
      "SELECT * FROM admin_users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_auth", "true", { httpOnly: true, path: "/", maxAge: 86400 });
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}