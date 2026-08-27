// lib/payments/mpesa.ts
import { timeoutMs } from "./utils";

async function getAccessToken(consumerKey?: string, consumerSecret?: string, baseUrl?: string) {
  if (!consumerKey || !consumerSecret) throw new Error("Mpesa consumer credentials missing");
  const creds = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const url = `${baseUrl ?? process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Basic ${creds}` },
    // @ts-ignore
    signal: AbortSignal.timeout(timeoutMs()),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Mpesa token error: ${res.status} ${txt}`);
  }
  const json = await res.json();
  return json.access_token ?? json.accessToken ?? json;
}

export async function initiateMpesaPayment(order: any, phoneNumber: string, credentials: { consumerKey?: string; consumerSecret?: string; shortcode?: string; passkey?: string; callbackUrl?: string; baseUrl?: string; sandbox?: boolean }) {
  const { consumerKey, consumerSecret, shortcode, passkey, callbackUrl, baseUrl } = credentials || {};
  if (!consumerKey || !consumerSecret || !shortcode || !passkey) throw new Error("Mpesa credentials incomplete");

  const token = await getAccessToken(consumerKey, consumerSecret, baseUrl);

  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);

  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(order.totalFinalPrice ?? order.totalPrice ?? 0),
    PartyA: formatPhone(phoneNumber),
    PartyB: shortcode,
    PhoneNumber: formatPhone(phoneNumber),
    CallBackURL: callbackUrl ?? process.env.MPESA_CALLBACK_URL,
    AccountReference: `ORD-${order.id ?? order.trackingNumber}`,
    TransactionDesc: `Payment for order ${order.trackingNumber}`,
  };

  const res = await fetch(`${baseUrl ?? process.env.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    // @ts-ignore
    signal: AbortSignal.timeout(timeoutMs()),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Mpesa STK push failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}


function formatPhone(phone: string) {
  // Remove spaces
  phone = phone.replace(/\s+/g, "");

  // If starts with +254 → convert to 254
  if (phone.startsWith("+254")) return phone.replace("+254", "254");

  // If starts with 07 → convert to 2547
  if (phone.startsWith("07")) return phone.replace(/^0/, "254");

  // If already 2547XXXXXXXX → keep it
  if (phone.startsWith("2547")) return phone;

  throw new Error("Invalid phone number format");
}
