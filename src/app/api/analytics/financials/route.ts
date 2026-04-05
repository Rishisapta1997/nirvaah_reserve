import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = parseInt(searchParams.get("range") || "30");
    const since = `NOW() - INTERVAL '${range} days'`;

    const [
      spendRes,
      orderRes,
      cogsRes,
      volumeRes,
      refundsRes
    ] = await Promise.all([
      // Total Marketing Spend
      pool.query(`SELECT COALESCE(SUM(spend_amount), 0) as total_spend FROM marketing_spend WHERE date >= DATE(${since})`),
      
      // Order Volumes & Balances
      pool.query(`
        SELECT 
           COUNT(*) as total_orders,
           SUM(token_amount) as total_tokens,
           SUM(total_amount) as gross_revenue_expected,
           SUM(discount_amount) as total_discounts
        FROM orders 
        WHERE created_at >= ${since} AND status != 'CANCELLED'
      `),

      // Cost of Goods Sold (only for paid/active items)
      pool.query(`
        SELECT COALESCE(SUM(p.cost_price), 0) as total_cogs 
        FROM orders o 
        JOIN products p ON o.product_id = p.id 
        WHERE o.created_at >= ${since} AND o.status != 'CANCELLED'
      `),

      // Trend of Revenue by day
      pool.query(`
        SELECT DATE(created_at) as date, SUM(total_amount) as daily_revenue
        FROM orders WHERE created_at >= ${since} AND status != 'CANCELLED'
        GROUP BY DATE(created_at) ORDER BY date ASC
      `),

      // Refunds & Cancellations
      pool.query(`
        SELECT COUNT(*) as refunds, COALESCE(SUM(token_amount), 0) as refunded_value
        FROM orders WHERE created_at >= ${since} AND status = 'CANCELLED'
      `)
    ]);

    const totalSpend = parseFloat(spendRes.rows[0].total_spend);
    const totalOrders = parseInt(orderRes.rows[0].total_orders) || 0;
    const grossRevenueExpected = parseFloat(orderRes.rows[0].gross_revenue_expected) || 0;
    const totalTokens = parseFloat(orderRes.rows[0].total_tokens) || 0;
    const totalDiscounts = parseFloat(orderRes.rows[0].total_discounts) || 0;
    const totalCogs = parseFloat(cogsRes.rows[0].total_cogs) || 0;
    
    // Constant assumption for shipping cost per order, as requested in architecture
    const avgShippingCost = 150; 
    const totalShipping = totalOrders * avgShippingCost;

    const netRevenue = grossRevenueExpected - totalDiscounts;
    // Net profit = Net Revenue - COGS - Shipping - Marketing Spend
    const netProfit = netRevenue - totalCogs - totalShipping - totalSpend;
    const netMarginPercent = netRevenue > 0 ? ((netProfit / netRevenue) * 100).toFixed(1) : "0";
    
    const cac = totalOrders > 0 ? Math.round(totalSpend / totalOrders) : 0;
    const aov = totalOrders > 0 ? Math.round(netRevenue / totalOrders) : 0;
    // Assuming LTV is simply AOV for now (if low repeat purchase rate), or apply a multiplier. We'll use AOV.
    const ltv = aov; 
    const ltvCacRatio = cac > 0 ? (ltv / cac).toFixed(1) : "N/A";
    const roas = totalSpend > 0 ? (netRevenue / totalSpend).toFixed(2) : "0";

    return NextResponse.json({
      unitEconomics: {
        cac,
        ltv,
        ltvCacRatio,
        roas,
        aov,
      },
      profitability: {
        netRevenue,
        netProfit,
        netMarginPercent,
        totalCogs,
        totalShipping,
        totalSpend,
      },
      cashflow: {
        tokensCollected: totalTokens,
        balancePending: netRevenue - totalTokens, 
      },
      cancellations: {
        count: parseInt(refundsRes.rows[0].refunds),
        value: parseFloat(refundsRes.rows[0].refunded_value)
      },
      revenueTrend: volumeRes.rows.map(r => ({
        date: r.date,
        dailyRevenue: parseFloat(r.daily_revenue)
      }))
    });

  } catch (err) {
    console.error("Financials error:", err);
    return NextResponse.json({ error: "Failed to load financials" }, { status: 500 });
  }
}
