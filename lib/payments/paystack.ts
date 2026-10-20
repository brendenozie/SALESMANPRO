import { PaystackCredentials, getPlatformPaystackCredentials } from "./resolver";

export interface InitializePaystackOptions {
  email: string;
  amount: number; // In standard currency units (e.g. KES), will be converted to lowest unit (kobo/cents * 100)
  reference?: string;
  currency?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  credentials?: PaystackCredentials;
}

export async function initiatePaystackPayment(
  order: any,
  email: string,
  credentials?: PaystackCredentials,
  customCallbackUrl?: string,
) {
  const amount = Number(order.totalFinalPrice ?? order.totalPrice ?? 0);
  const currency = order.currency || "KES";
  const reference = order.trackingNumber || `REF-${order.id}-${Date.now()}`;

  return initializePaystackTransaction({
    email,
    amount,
    currency,
    reference,
    callbackUrl: customCallbackUrl,
    metadata: {
      purpose: "ORDER",
      orderId: order.id,
      companyId: order.companyId,
      trackingNumber: order.trackingNumber,
      customerEmail: email,
    },
    credentials,
  });
}

/**
 * Universal Paystack Transaction Initializer for Orders, AI Credits, and Subscriptions.
 */
export async function initializePaystackTransaction(options: InitializePaystackOptions) {
  const {
    email,
    amount,
    currency = "KES",
    reference = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    callbackUrl,
    metadata = {},
    credentials,
  } = options;

  const creds = credentials || getPlatformPaystackCredentials();
  const secret = creds.secretKey || process.env.PAYSTACK_SECRET_KEY || "";
  const baseUrl = creds.baseUrl || process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";
  const resolvedCallback =
    callbackUrl ||
    creds.callbackUrl ||
    `${process.env.NEXT_PUBLIC_BASE_URL || "https://salesmanpro.store"}/payments/paystack/callback`;

  if (!secret) {
    throw new Error("Paystack secret key is missing");
  }

  const amountInLowestUnit = Math.round(Number(amount) * 100);

  const payload = {
    email,
    amount: amountInLowestUnit,
    currency,
    reference,
    callback_url: resolvedCallback,
    metadata: {
      ...metadata,
      reference,
      timestamp: new Date().toISOString(),
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  let data: any;
  try {
    const res = await fetch(`${baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    data = await res.json();
  } catch (err: any) {
    clearTimeout(timer);
    throw new Error(`Paystack request error: ${err.message}`);
  }

  if (!data.status) {
    throw new Error(data.message || "Paystack initialization failed");
  }

  return {
    authorization_url: data.data.authorization_url,
    access_code: data.data.access_code,
    reference: data.data.reference,
  };
}

/**
 * Authoritatively verifies a transaction reference directly against Paystack API.
 */
export async function verifyPaystackTransaction(
  reference: string,
  credentials?: PaystackCredentials,
) {
  const creds = credentials || getPlatformPaystackCredentials();
  const secret = creds.secretKey || process.env.PAYSTACK_SECRET_KEY || "";
  const baseUrl = creds.baseUrl || process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";

  if (!secret) {
    throw new Error("Paystack secret key is missing");
  }

  const res = await fetch(`${baseUrl}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Failed to verify Paystack transaction");
  }

  return data.data;
}
