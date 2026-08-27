// lib/payments/paystack.ts
// import fetch from "node-fetch";

const TIMEOUT = Number(process.env.PAYMENTS_REQUEST_TIMEOUT_MS ?? 10000);

export async function initiatePaystackPayment(order: any, customerEmail: string, credentials: { secretKey?: string; baseUrl?: string }) {
  const secret = credentials.secretKey ?? process.env.PAYSTACK_SECRET_KEY;
  const baseUrl = credentials.baseUrl ?? process.env.PAYSTACK_BASE_URL ?? "https://api.paystack.co";

  if (!secret) throw new Error("Paystack secret key missing");

  // Create transaction (initialize)
  const body = {
    email: customerEmail,
    amount: Math.round(order.totalPrice * 100), // kobo
    metadata: {
      orderId: order.id,
      trackingNumber: order.trackingNumber,
    },
    callback_url: process.env.PAYSTACK_CALLBACK_URL ?? undefined,
  };

  const res = await fetch(`${baseUrl}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    // timeout: TIMEOUT,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Paystack init failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json; // contains authorization_url, access_code, reference
}
