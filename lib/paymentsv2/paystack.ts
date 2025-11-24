// lib/payments/paystack.ts
import { timeoutMs } from "./utils";

export async function initiatePaystackPayment(order: any, customerEmail: string, credentials: { secretKey?: string; baseUrl?: string; callbackUrl?: string }) {
  const secret = credentials?.secretKey ?? process.env.PAYSTACK_SECRET_KEY;
  const baseUrl = credentials?.baseUrl ?? process.env.PAYSTACK_BASE_URL ?? "https://api.paystack.co";
  const callbackUrl = credentials?.callbackUrl ?? `${process.env.NEXT_PUBLIC_BASE_URL}/payments/paystack/callback`;//process.env.PAYSTACK_CALLBACK_URL;

  if (!secret) throw new Error("Paystack secret key missing");

  const body = {
    email: customerEmail,
    amount: Math.round((order.totalFinalPrice ?? order.totalPrice ?? 0) * 100),
    metadata: { orderId: order.id, trackingNumber: order.trackingNumber },
    callback_url: callbackUrl,
  };

  const res = await fetch(`${baseUrl}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    // @ts-ignore
    signal: AbortSignal.timeout(timeoutMs()),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Paystack initialize failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}
