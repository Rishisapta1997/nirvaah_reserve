import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = parseInt(searchParams.get("range") || "30");
    const since = `NOW() - INTERVAL '${range} days'`;

    // BCG Matrix: Volume vs Margin
    const matrixRes = await pool.query(`
      SELECT p.id, p.name, p.price, p.cost_price, COUNT(o.id) as volume
      FROM products p
      LEFT JOIN orders o ON o.product_id = p.id AND o.created_at >= ${since} AND o.status != 'CANCELLED'
      GROUP BY p.id, p.name, p.price, p.cost_price
    `);

    const matrix = matrixRes.rows.map(r => {
      let spNum = 0; 
      try { spNum = parseInt((r.price || "").replace(/[^0-9]/g, '')); } catch(e){}
      const cost = parseFloat(r.cost_price || "0");
      const margin = spNum > 0 ? (((spNum - cost) / spNum) * 100).toFixed(1) : "0";
      
      return {
        id: r.id,
        name: r.name,
        volume: parseInt(r.volume),
        margin: parseFloat(margin)
      };
    });

    return NextResponse.json({ matrix });
  } catch (err) {
    console.error("Matrix error:", err);
    return NextResponse.json({ error: "Failed to load product matrix" }, { status: 500 });
  }
}
