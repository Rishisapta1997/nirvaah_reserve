import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY not configured. Payment features disabled.');
}

export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil',
    })
  : null;

export const STRIPE_CONFIG = {
  isConfigured: !!stripe,
  mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test',
};

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function getStripePublishableKey(): string {
  return process.env.STRIPE_PUBLISHABLE_KEY || '';
}

export const PAYMENT_CONFIG = {
  currency: 'inr',
  tokenAmount: 199,
  webhookEndpoint: '/api/webhooks/stripe',
};

export interface CreatePaymentIntentData {
  amount: number;
  productName: string;
  orderNumber: string;
  customerEmail?: string;
}

export async function createPaymentIntent(data: CreatePaymentIntentData): Promise<{
  clientSecret: string;
  paymentIntentId: string;
} | null> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(data.amount * 100),
    currency: PAYMENT_CONFIG.currency,
    metadata: {
      orderNumber: data.orderNumber,
      productName: data.productName,
    },
    ...(data.customerEmail && {
      receipt_email: data.customerEmail,
    }),
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

export async function retrievePaymentIntent(paymentIntentId: string): Promise<any> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return stripe.paymentIntents.retrieve(paymentIntentId);
}

export function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe is not configured');
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}