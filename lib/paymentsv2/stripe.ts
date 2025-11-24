// lib/payments/stripe.ts
import { timeoutMs } from "./utils";

/**
 * Minimal Stripe usage via HTTP. For a production app, use stripe-node SDK
 * which handles signing, retries, idempotency.
 */

export async function initiateStripePaymentIntent(order: any, credentials: { secretKey?: string }) {
  const secret = credentials?.secretKey ?? process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Stripe secret key missing");

  const amount = Math.round((order.totalFinalPrice ?? order.totalPrice ?? 0) * 100); // cents

  const params = new URLSearchParams();
  params.append("amount", String(amount));
  params.append("currency", (order.currency ?? process.env.DEFAULT_CURRENCY ?? "KES").toLowerCase());
  params.append("payment_method_types[]", "card");
  params.append("metadata[order_id]", String(order.id ?? order.trackingNumber));

  const res = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    // @ts-ignore
    signal: AbortSignal.timeout(timeoutMs()),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Stripe PaymentIntent failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}
