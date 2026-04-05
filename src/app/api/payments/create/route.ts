import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent, isStripeConfigured } from "@/lib/stripe/config";

export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({
        success: false,
        error: "Payment system not configured",
        message: "Stripe is not configured. Add your Stripe API keys to enable payments.",
        setupRequired: true,
      }, { status: 503 });
    }

    const body = await req.json();
    const { amount, productName, orderNumber, customerEmail } = body;

    if (!amount || !orderNumber) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields",
      }, { status: 400 });
    }

    const result = await createPaymentIntent({
      amount,
      productName: productName || 'Nirvaah Product',
      orderNumber,
      customerEmail,
    });

    if (!result) {
      return NextResponse.json({
        success: false,
        error: "Failed to create payment intent",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error: any) {
    console.error('Payment intent creation failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const configured = isStripeConfigured();
  
  return NextResponse.json({
    success: true,
    configured,
    mode: configured ? 'test' : 'not_configured',
    message: configured 
      ? 'Stripe payment system is ready in test mode' 
      : 'Stripe not configured. Add STRIPE_SECRET_KEY to enable payments.',
  });
}