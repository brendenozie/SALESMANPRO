import prisma from "@/server/db/prismadb";
import { fetchWithCache } from "@/lib/cache";
import { normalizePhoneNumber } from "@/lib/whatsapp/normalizePhone";
import { MpesaCredentials, getPlatformMpesaCredentials } from "./resolver";

/**
 * Cache Safaricom Daraja OAuth access token for 50 minutes (valid for 3600s).
 * Eliminates 500-2000ms latency on every checkout attempt.
 */
export async function getMpesaToken(credentials?: Partial<MpesaCredentials>): Promise<string> {
  const creds = credentials || getPlatformMpesaCredentials();
  const consumerKey = creds.consumerKey || process.env.MPESA_CONSUMER_KEY || "";
  const consumerSecret = creds.consumerSecret || process.env.MPESA_CONSUMER_SECRET || "";
  const baseUrl = creds.baseUrl || process.env.MPESA_BASE_URL || "https://api.safaricom.co.ke";

  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa consumer key or secret is missing");
  }

  const cacheKey = `daraja:oauth:token:${consumerKey.substring(0, 10)}`;

  return fetchWithCache(
    cacheKey,
    async () => {
      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch(
          `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
          {
            headers: { Authorization: `Basic ${auth}` },
            signal: controller.signal,
          },
        );
        clearTimeout(timer);

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Daraja OAuth failed with HTTP ${res.status}: ${txt}`);
        }

        const data = await res.json();
        return (data.access_token || data.accessToken) as string;
      } catch (err: any) {
        clearTimeout(timer);
        throw new Error(`Failed to fetch M-Pesa token: ${err.message}`);
      }
    },
    { ttlSeconds: 3000 }, // 50 minutes
  );
}

export interface InitiateStkPushOptions {
  phoneNumber?: string;
  phone?: string;
  amount: number;
  accountReference: string;
  transactionDesc?: string;
  callbackUrl?: string;
  orderId?: string;
  credentials?: MpesaCredentials;
}

export type SendMpesaStkPushOptions = InitiateStkPushOptions;

/**
 * Direct M-Pesa STK Push function for Subscriptions, Orders, and Top-ups.
 * Fully compatible with sendMpesaStkPush imports.
 */
export async function sendMpesaStkPush(options: SendMpesaStkPushOptions) {
  return executeStkPush(options);
}

export async function initiateMpesaPayment(order: any, phoneNumber: string, credentials?: MpesaCredentials) {
  const amount = order.totalFinalPrice ? Math.round(Number(order.totalFinalPrice)) : 1;
  const accountReference = String(order.trackingNumber || order.id || "ORD").substring(0, 12);
  const transactionDesc = `Payment for order ${order.trackingNumber || order.id}`.substring(0, 32);

  return executeStkPush({
    phoneNumber,
    amount,
    accountReference,
    transactionDesc,
    orderId: order.id,
    credentials,
  });
}

/**
 * Universal STK Push executor for Orders, AI Credits, and Subscriptions.
 */
export async function executeStkPush(options: InitiateStkPushOptions) {
  const {
    phoneNumber,
    phone,
    amount,
    accountReference,
    transactionDesc = "Payment",
    callbackUrl: customCallbackUrl,
    orderId,
    credentials,
  } = options;

  const rawPhone = phoneNumber || phone;
  if (!rawPhone) {
    throw new Error("Phone number is required for M-Pesa STK push");
  }

  const creds = credentials || getPlatformMpesaCredentials();
  const formattedPhone = formatPhone(rawPhone);
  const token = await getMpesaToken(creds);
  const timestamp = generateTimestamp();

  const shortcode = creds.shortcode || process.env.MPESA_SHORTCODE || "";
  const passkey = creds.passkey || process.env.MPESA_PASSKEY || process.env.MPESA_PASS_KEY || "";
  const callbackUrl =
    customCallbackUrl ||
    creds.callbackUrl ||
    process.env.MPESA_CALLBACK_URL ||
    `${process.env.NEXT_PUBLIC_BASE_URL || "https://salesmanpro.store"}/api/mpesa/callback`;
  const baseUrl = creds.baseUrl || process.env.MPESA_BASE_URL || "https://api.safaricom.co.ke";
  const transactionType = creds.transactionType || "CustomerPayBillOnline";
  const partyB = creds.partyB || shortcode;

  if (!shortcode || !passkey) {
    throw new Error("M-Pesa shortcode or passkey is missing");
  }

  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

  const sanitizedRef = (accountReference || "SalesmanPro")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .substring(0, 12) || "SalesmanPro";

  const sanitizedDesc = (transactionDesc || "SalesmanPro Payment")
    .replace(/[^a-zA-Z0-9_\s-]/g, "")
    .substring(0, 32) || "SalesmanPro Payment";

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: transactionType,
    Amount: Math.max(1, Math.round(amount)),
    PartyA: formattedPhone,
    PartyB: partyB,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: sanitizedRef,
    TransactionDesc: sanitizedDesc,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const result = await res.json();

    if (result.ResponseCode === "0" && orderId) {
      await prisma.customerOrder.update({
        where: { id: orderId },
        data: {
          trackingNumber: result.CheckoutRequestID || undefined,
          transactionReference: result.CheckoutRequestID || result.MerchantRequestID,
          paymentMethod: "MPESA",
          paymentStatus: "INITIATED",
        },
      }).catch((e) => {
        console.warn("[MPESA_ORDER_UPDATE_WARN]", e.message);
      });
    }

    return result;
  } catch (err: any) {
    clearTimeout(timer);
    throw new Error(`M-Pesa STK push error: ${err.message}`);
  }
}

function generateTimestamp() {
  const date = new Date();
  // Kenya Time is UTC+3
  const kenyaTime = new Date(date.getTime() + 3 * 60 * 60 * 1000);

  return kenyaTime
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
}

function formatPhone(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (/^254\d{9}$/.test(normalized)) {
    return normalized;
  }
  throw new Error(`Invalid phone number format for M-Pesa: ${phone}. Expected 2547XXXXXXXX or 2541XXXXXXXX`);
}
