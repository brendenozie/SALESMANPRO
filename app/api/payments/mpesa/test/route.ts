import { jsonResponse } from "@/lib/apiResponse";
import { fetchWithTimeout } from "@/lib/fetchSafe";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    const { mpesaConsumerKey, mpesaConsumerSecret, sandbox } = await req.json();
    const key = mpesaConsumerKey ?? process.env.MPESA_CONSUMER_KEY;
    const secret = mpesaConsumerSecret ?? process.env.MPESA_CONSUMER_SECRET;
    const useSandbox = sandbox ?? process.env.MPESA_USE_SANDBOX === "true";

    if (!key || !secret) return jsonResponse({ ok: false, error: "Daraja consumer key/secret missing" }, 400);

    const base = useSandbox ? "https://sandbox.safaricom.co.ke" : "https://api.safaricom.co.ke";
    const url = `${base}/oauth/v1/generate?grant_type=client_credentials`;

    const res = await fetchWithTimeout(url, {
      method: "GET",
      headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` },
    }, 8000);

    if (!res.ok) return jsonResponse({ ok: false, status: res.status, data: res.data }, 401);

    return jsonResponse({ ok: true, token: res.data });
  } catch (err: any) {
    Sentry.captureException(err);
    return jsonResponse({ ok: false, error: err.message ?? String(err) }, 500);
  }
}
