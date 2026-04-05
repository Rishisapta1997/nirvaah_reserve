import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
}

export async function GET(req: NextRequest) {
  try {
    // Get all products
    const productsResult = await pool.query(`
      SELECT id, name, stock_quantity, price, category FROM products WHERE status = 'ACTIVE'
    `);

    const products = productsResult.rows;
    
    // Calculate stats
    let totalProducts = products.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalUnits = 0;
    let totalStockValue = 0;
    
    const categoryMap: Record<string, { products: number, quantity: number, value: number }> = {};
    const reorderAlerts: any[] = [];
    const topSelling: any[] = [];
    
    for (const p of products) {
      const qty = p.stock_quantity || 0;
      const price = parsePrice(p.price);
      
      totalUnits += qty;
      totalStockValue += qty * price;
      
      if (qty > 50) inStock++;
      else if (qty > 0) lowStock++;
      else outOfStock++;
      
      if (qty <= 10) {
        reorderAlerts.push({ id: p.id, name: p.name, quantity: qty, threshold: 10, price });
      }
      
      // Category aggregation
      const cat = p.category || 'Other';
      if (!categoryMap[cat]) categoryMap[cat] = { products: 0, quantity: 0, value: 0 };
      categoryMap[cat].products++;
      categoryMap[cat].quantity += qty;
      categoryMap[cat].value += qty * price;
    }
    
    // Get order counts per product
    const orderCountsResult = await pool.query(`
      SELECT product_id, COUNT(*) as cnt, SUM(total_amount) as revenue
      FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY product_id
    `);
    
    const orderCounts: Record<string, { cnt: number, revenue: number }> = {};
    for (const o of orderCountsResult.rows) {
      orderCounts[o.product_id] = { cnt: parseInt(o.cnt), revenue: parseFloat(o.revenue) || 0 };
    }
    
    // Map top selling
    for (const p of products) {
      if (orderCounts[p.id]) {
        topSelling.push({
          id: p.id,
          name: p.name,
          sku: p.sku,
          currentStock: p.stock_quantity,
          sold30d: orderCounts[p.id].cnt,
          revenue30d: orderCounts[p.id].revenue,
        });
      }
    }
    
    topSelling.sort((a, b) => b.sold30d - a.sold30d);
    
    const byCategory = Object.entries(categoryMap).map(([name, data]) => ({
      id: name,
      name,
      products: data.products,
      quantity: data.quantity,
      stockValue: data.value,
    }));

    return NextResponse.json({
      overview: {
        totalProducts,
        inStock,
        lowStock,
        outOfStock,
        totalUnits,
      },
      stockValue: {
        retail: totalStockValue,
        cost: totalStockValue * 0.4,
        potentialMargin: totalStockValue * 0.6,
      },
      reorderAlerts: reorderAlerts.slice(0, 10),
      byCategory,
      topSelling: topSelling.slice(0, 10),
      slowMoving: products.filter(p => p.stock_quantity > 100).slice(0, 10).map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        quantity: p.stock_quantity,
        price: parsePrice(p.price),
        sold: 0,
        views: 0,
      })),
    });
  } catch (err) {
    console.error("Inventory API error:", err);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}