import { jsonResponse } from "@/lib/apiResponse";
import { fetchWithTimeout } from "@/lib/fetchSafe";
import * as Sentry from "@sentry/nextjs";
import { Buffer } from "buffer";

function timestamp() {
  const d = new Date();
  const YYYY = d.getUTCFullYear();
  const MM = String(d.getUTCMonth() + 1).padStart(2, "0");
  const DD = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${YYYY}${MM}${DD}${hh}${mm}${ss}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const useSandbox = body.sandbox ?? process.env.MPESA_USE_SANDBOX === "true";
    const consumerKey = body.mpesaConsumerKey ?? process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = body.mpesaConsumerSecret ?? process.env.MPESA_CONSUMER_SECRET;
    const passkey = body.passkey ?? process.env.MPESA_PASSKEY; // Lipa Na M-Pesa passkey
    const shortcode = body.mpesaShortcode ?? process.env.MPESA_SHORTCODE;
    const callbackUrl = body.mpesaCallbackUrl ?? process.env.MPESA_CALLBACK_URL;

    if (!consumerKey || !consumerSecret || !passkey || !shortcode || !callbackUrl) {
      return jsonResponse({ ok: false, error: "Missing mpesa credentials/shortcode/passkey/callback" }, 400);
    }

    const base = useSandbox ? "https://sandbox.safaricom.co.ke" : "https://api.safaricom.co.ke";
    // 1) Get access token
    const tokenRes = await fetchWithTimeout(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`,
      },
    }, 8000);

    if (!tokenRes.ok) {
      return jsonResponse({ ok: false, error: "Failed to get daraja token", data: tokenRes.data }, 401);
    }

    const accessToken = tokenRes.data?.access_token;
    if (!accessToken) return jsonResponse({ ok: false, error: "No access token returned" }, 500);

    // 2) Build STK Push payload (requires phone & amount)
    const { phoneNumber, amount, accountReference = "Ref", transactionDesc = "Payment" } = body;
    if (!phoneNumber || !amount) return jsonResponse({ ok: false, error: "phoneNumber and amount required" }, 400);

    const ts = timestamp();
    const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64");

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: Number(amount),
      PartyA: phoneNumber,
      PartyB: shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    };

    const stkUrl = `${base}/mpesa/stkpush/v1/processrequest`;
    const stkRes = await fetchWithTimeout(stkUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }, 10000);

    if (!stkRes.ok) {
      Sentry.captureMessage("STK Push failed", { level: "warning", extra: { stkRes } });
      return jsonResponse({ ok: false, data: stkRes.data, status: stkRes.status }, 502);
    }

    return jsonResponse({ ok: true, data: stkRes.data });
  } catch (err: any) {
    Sentry.captureException(err);
    return jsonResponse({ ok: false, error: err.message ?? String(err) }, 500);
  }
}
