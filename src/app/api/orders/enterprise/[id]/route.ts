import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const orderResult = await pool.query(
      `SELECT o.*, c.first_name, c.last_name, c.email as customer_email, c.phone as customer_phone
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await pool.query(
      `SELECT oi.*, p.name as product_name, p.images as product_images
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [id]
    );

    // Get timeline
    const timelineResult = await pool.query(
      `SELECT * FROM order_timeline WHERE order_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    // Get payments
    const paymentsResult = await pool.query(
      `SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    return NextResponse.json({
      id: order.id,
      orderNumber: order.order_number,
      customerId: order.customer_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email || order.customer_email,
      customerPhone: order.customer_phone || order.customer_phone,
      orderType: order.order_type,
      source: order.source,
      status: order.status,
      paymentStatus: order.payment_status,
      fulfillmentStatus: order.fulfillment_status,
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
      subtotal: parseFloat(order.subtotal),
      discountTotal: parseFloat(order.discount_total),
      taxAmount: parseFloat(order.tax_amount),
      shippingCost: parseFloat(order.shipping_cost),
      total: parseFloat(order.total),
      tokenAmount: parseFloat(order.token_amount),
      tokenPaid: order.token_paid,
      balanceAmount: parseFloat(order.balance_amount),
      balancePaid: order.balance_paid,
      totalPaid: parseFloat(order.total_paid),
      trackingNumber: order.tracking_number,
      shippingPartner: order.shipping_partner,
      trackingUrl: order.tracking_url,
      notes: order.notes,
      adminNotes: order.admin_notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      confirmedAt: order.confirmed_at,
      cancelledAt: order.cancelled_at,
      completedAt: order.completed_at,
      items: itemsResult.rows.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        variantName: item.variant_name,
        sku: item.sku,
        imageUrl: item.image_url || (item.product_images ? JSON.parse(item.product_images)[0] : null),
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
        total: parseFloat(item.total),
      })),
      timeline: timelineResult.rows.map((t: any) => ({
        id: t.id,
        eventType: t.event_type,
        title: t.title,
        description: t.description,
        createdAt: t.created_at,
      })),
      payments: paymentsResult.rows.map((p: any) => ({
        id: p.id,
        paymentNumber: p.payment_number,
        paymentType: p.payment_type,
        paymentMethod: p.payment_method,
        amount: parseFloat(p.amount),
        status: p.status,
        createdAt: p.created_at,
        processedAt: p.processed_at,
      })),
    });
  } catch (err) {
    console.error("Get order error:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      status, paymentStatus, fulfillmentStatus,
      trackingNumber, shippingPartner, trackingUrl,
      adminNotes, tokenPaid, balancePaid
    } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
      
      // Add status history
      await pool.query(
        `INSERT INTO order_status_history (id, order_id, status, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [crypto.randomUUID(), id, status]
      );

      // Add timeline event
      await pool.query(
        `INSERT INTO order_timeline (id, order_id, event_type, title, created_at)
         VALUES ($1, $2, $3, $4)`,
        [
          crypto.randomUUID(), id,
          status === 'CONFIRMED' ? 'ORDER_CONFIRMED' :
          status === 'PROCESSING' ? 'PROCESSING_STARTED' :
          status === 'SHIPPED' ? 'ORDER_SHIPPED' :
          status === 'DELIVERED' ? 'ORDER_DELIVERED' :
          status === 'CANCELLED' ? 'ORDER_CANCELLED' : 'STATUS_UPDATED',
          status
        ]
      );

      if (status === 'CONFIRMED') {
        updates.push(`confirmed_at = NOW()`);
      }
      if (status === 'CANCELLED') {
        updates.push(`cancelled_at = NOW()`);
      }
      if (status === 'DELIVERED') {
        updates.push(`completed_at = NOW()`);
      }
    }

    if (paymentStatus !== undefined) {
      updates.push(`payment_status = $${paramIndex++}`);
      values.push(paymentStatus);
    }

    if (fulfillmentStatus !== undefined) {
      updates.push(`fulfillment_status = $${paramIndex++}`);
      values.push(fulfillmentStatus);
    }

    if (trackingNumber !== undefined) {
      updates.push(`tracking_number = $${paramIndex++}`);
      values.push(trackingNumber || null);
    }

    if (shippingPartner !== undefined) {
      updates.push(`shipping_partner = $${paramIndex++}`);
      values.push(shippingPartner || null);
    }

    if (trackingUrl !== undefined) {
      updates.push(`tracking_url = $${paramIndex++}`);
      values.push(trackingUrl || null);
    }

    if (adminNotes !== undefined) {
      updates.push(`admin_notes = $${paramIndex++}`);
      values.push(adminNotes || null);
    }

    if (tokenPaid !== undefined) {
      updates.push(`token_paid = $${paramIndex++}`);
      values.push(tokenPaid);
      
      if (tokenPaid) {
        await pool.query(
          `INSERT INTO order_timeline (id, order_id, event_type, title, created_at)
           VALUES ($1, $2, 'PAYMENT_RECEIVED', 'Token Payment Received', NOW())`,
          [crypto.randomUUID(), id]
        );
      }
    }

    if (balancePaid !== undefined) {
      updates.push(`balance_paid = $${paramIndex++}`);
      values.push(balancePaid);

      // Update total paid
      const orderResult = await pool.query(`SELECT token_amount, total FROM orders WHERE id = $1`, [id]);
      if (orderResult.rows.length > 0) {
        const tokenAmount = parseFloat(orderResult.rows[0].token_amount);
        const total = parseFloat(orderResult.rows[0].total);
        const newTotalPaid = tokenPaid ? tokenAmount : 0;
        updates.push(`total_paid = $${paramIndex++}`);
        values.push(tokenPaid ? (balancePaid ? total : tokenAmount) : 0);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    await pool.query(
      `UPDATE orders SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update order error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}