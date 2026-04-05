import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `SELECT p.*, c.name as category_name, b.name as brand_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const p = result.rows[0];
    return NextResponse.json({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      shortDescription: p.short_description,
      productType: p.product_type,
      categoryId: p.category_id,
      categoryName: p.category_name,
      brandId: p.brand_id,
      brandName: p.brand_name,
      basePrice: parseFloat(p.base_price),
      comparePrice: p.compare_price ? parseFloat(p.compare_price) : null,
      bookingPrice: p.booking_price ? parseFloat(p.booking_price) : null,
      quantity: p.quantity,
      lowStockThreshold: p.low_stock_threshold,
      images: p.images,
      thumbnailUrl: p.thumbnail_url,
      weight: p.weight ? parseFloat(p.weight) : null,
      colors: p.colors,
      sizes: p.sizes,
      status: p.status,
      isFeatured: p.is_featured,
      isActive: p.is_active,
      tags: p.tags,
      viewCount: p.view_count,
      soldCount: p.sold_count,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    });
  } catch (err) {
    console.error("Get product error:", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name, slug, sku, description, shortDescription,
      categoryId, brandId,
      basePrice, comparePrice, bookingPrice,
      quantity, lowStockThreshold,
      images, thumbnailUrl, weight,
      metaTitle, metaDescription,
      status, isFeatured, isActive,
      tags, warrantyMonths, returnDays
    } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) { updates.push(`name = $${paramIndex++}`); values.push(name); }
    if (slug !== undefined) { updates.push(`slug = $${paramIndex++}`); values.push(slug); }
    if (sku !== undefined) { updates.push(`sku = $${paramIndex++}`); values.push(sku); }
    if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }
    if (shortDescription !== undefined) { updates.push(`short_description = $${paramIndex++}`); values.push(shortDescription); }
    if (categoryId !== undefined) { updates.push(`category_id = $${paramIndex++}`); values.push(categoryId || null); }
    if (brandId !== undefined) { updates.push(`brand_id = $${paramIndex++}`); values.push(brandId || null); }
    if (basePrice !== undefined) { updates.push(`base_price = $${paramIndex++}`); values.push(basePrice); }
    if (comparePrice !== undefined) { updates.push(`compare_price = $${paramIndex++}`); values.push(comparePrice || null); }
    if (bookingPrice !== undefined) { updates.push(`booking_price = $${paramIndex++}`); values.push(bookingPrice || null); }
    if (quantity !== undefined) { updates.push(`quantity = $${paramIndex++}`); values.push(quantity); }
    if (lowStockThreshold !== undefined) { updates.push(`low_stock_threshold = $${paramIndex++}`); values.push(lowStockThreshold); }
    if (images !== undefined) { updates.push(`images = $${paramIndex++}`); values.push(JSON.stringify(images)); }
    if (thumbnailUrl !== undefined) { updates.push(`thumbnail_url = $${paramIndex++}`); values.push(thumbnailUrl); }
    if (weight !== undefined) { updates.push(`weight = $${paramIndex++}`); values.push(weight); }
    if (metaTitle !== undefined) { updates.push(`meta_title = $${paramIndex++}`); values.push(metaTitle); }
    if (metaDescription !== undefined) { updates.push(`meta_description = $${paramIndex++}`); values.push(metaDescription); }
    if (status !== undefined) { updates.push(`status = $${paramIndex++}`); values.push(status); }
    if (isFeatured !== undefined) { updates.push(`is_featured = $${paramIndex++}`); values.push(isFeatured); }
    if (isActive !== undefined) { updates.push(`is_active = $${paramIndex++}`); values.push(isActive); }
    if (tags !== undefined) { updates.push(`tags = $${paramIndex++}`); values.push(JSON.stringify(tags)); }
    if (warrantyMonths !== undefined) { updates.push(`warranty_months = $${paramIndex++}`); values.push(warrantyMonths); }
    if (returnDays !== undefined) { updates.push(`return_days = $${paramIndex++}`); values.push(returnDays); }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    await pool.query(
      `UPDATE products SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update product error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}