import { NextRequest, NextResponse } from "next/server";
import { stripe, constructWebhookEvent, isStripeConfigured } from "@/lib/stripe/config";
import { pool } from "@/lib/db";
import { sendOrderStatusUpdateEmail } from "@/lib/email/sender";

export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderNumber = paymentIntent.metadata?.orderNumber;

        if (orderNumber) {
          await pool.query(
            `UPDATE orders SET token_paid = true, status = 'CONFIRMED', payment_id = $1, payment_status = 'paid'
             WHERE order_number = $2`,
            [paymentIntent.id, orderNumber]
          );

          const orderResult = await pool.query(
            `SELECT o.*, c.email as customer_email, c.name as customer_name
             FROM orders o
             LEFT JOIN customers c ON c.id = o.customer_id
             WHERE o.order_number = $1`,
            [orderNumber]
          );

          if (orderResult.rows[0]) {
            const order = orderResult.rows[0];
            await sendOrderStatusUpdateEmail({
              orderNumber: order.order_number,
              customerName: order.customer_name,
              customerEmail: order.customer_email,
              status: 'CONFIRMED',
              statusMessage: 'Your payment has been confirmed. We are processing your order.',
              trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.order_number}`,
            });
          }

          console.log(`✅ Payment confirmed for order ${orderNumber}`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const orderNumber = paymentIntent.metadata?.orderNumber;

        if (orderNumber) {
          await pool.query(
            `UPDATE orders SET payment_status = 'failed'
             WHERE order_number = $1`,
            [orderNumber]
          );

          console.log(`❌ Payment failed for order ${orderNumber}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}