import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: any) {
  const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [params.id]);
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: any) {
  try {
    const body = await req.json();
    const fieldMap: Record<string, string> = {
      name: "name",
      type: "type",
      price: "price",
      oldPrice: "old_price",
      image: "image",
      features: "features",
      isCombo: "is_combo",
      category: "category",
      status: "status",
      bookingPrice: "booking_price", // ✅ NEW
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, col] of Object.entries(fieldMap)) {
      if (key in body) {
        setClauses.push(`${col} = $${idx++}`);
        let val = body[key];
        if (key === "features" && Array.isArray(val)) val = JSON.stringify(val);
        values.push(val);
      }
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(params.id);

    const { rows } = await pool.query(
      `UPDATE products SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("PATCH /api/products error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await pool.query(
      "UPDATE products SET status = 'ARCHIVED', updated_at = NOW() WHERE id = $1",
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/products error:", err);
    return NextResponse.json({ error: "Archive failed" }, { status: 500 });
  }
}