import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (category) {
      whereClause += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM products ${whereClause}`,
      params
    );

    const productsResult = await pool.query(
      `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    const categoriesResult = await pool.query(
      `SELECT DISTINCT category FROM products WHERE category IS NOT NULL`
    );

    return NextResponse.json({
      products: productsResult.rows.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.name?.toLowerCase().replace(/ /g, '-'),
        sku: p.sku,
        description: p.description,
        categoryId: p.category_id,
        categoryName: p.category,
        basePrice: parseFloat(p.price) || 0,
        comparePrice: p.old_price ? parseFloat(p.old_price) : null,
        bookingPrice: p.booking_price || 199,
        quantity: p.stock_quantity || 0,
        images: p.images || [p.image],
        thumbnailUrl: p.image,
        status: p.status,
        isFeatured: p.is_featured,
        isActive: p.status === 'ACTIVE',
        tags: [],
        viewCount: 0,
        soldCount: 0,
        ratingAvg: 0,
        reviewCount: 0,
        totalSold: 0,
        createdAt: p.created_at,
      })),
      total: parseInt(countResult.rows[0].total),
      page,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
      categories: categoriesResult.rows.map((c: any) => ({ id: c.category, name: c.category })),
    });
  } catch (err) {
    console.error("Products API error:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, price, category, description, stock_quantity, status, is_featured, booking_price, image, old_price } = body;

    const productId = Math.random().toString(36).substring(2, 15);

    await pool.query(
      `INSERT INTO products (id, name, price, category, description, stock_quantity, status, is_featured, booking_price, image, old_price, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      [productId, name, String(price), category, description, stock_quantity || 0, status || 'ACTIVE', is_featured || false, booking_price || 199, image, old_price]
    );

    return NextResponse.json({ success: true, productId });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}