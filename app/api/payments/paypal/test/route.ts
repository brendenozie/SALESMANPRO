import { jsonResponse } from "@/lib/apiResponse";
import { fetchWithTimeout } from "@/lib/fetchSafe";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const clientId = body.paypalClientId ?? process.env.PAYPAL_CLIENT_ID;
    const secret = body.paypalClientSecret ?? process.env.PAYPAL_SECRET;
    const sandbox = body.sandbox ?? process.env.PAYPAL_USE_SANDBOX === "true";

    if (!clientId) return jsonResponse({ ok: false, error: "PayPal client id missing" }, 400);

    const base = sandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
    const tokenUrl = `${base}/v1/oauth2/token`;

    const params = new URLSearchParams();
    params.set("grant_type", "client_credentials");

    const res = await fetchWithTimeout(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret ?? ""}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }, 8000);

    if (!res.ok) {
      return jsonResponse({ ok: false, status: res.status, data: res.data }, 401);
    }

    return jsonResponse({ ok: true, token: res.data });
  } catch (err: any) {
    Sentry.captureException(err);
    return jsonResponse({ ok: false, error: err.message ?? String(err) }, 500);
  }
}
