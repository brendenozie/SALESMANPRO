import { jsonResponse } from "@/lib/apiResponse";
import { fetchWithTimeout } from "@/lib/fetchSafe";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    const { paystackSecretKey } = await req.json();
    const secret = paystackSecretKey ?? process.env.PAYSTACK_SECRET;
    if (!secret) return jsonResponse({ ok: false, error: "Paystack secret missing" }, 400);

    const url = "https://api.paystack.co/integration/payment_session_timeout";
    const res = await fetchWithTimeout(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${secret}` },
    }, 8000);

    if (!res.ok) {
      return jsonResponse({ ok: false, status: res.status, data: res.data }, 401);
    }
    return jsonResponse({ ok: true, data: res.data });
  } catch (err: any) {
    Sentry.captureException(err);
    return jsonResponse({ ok: false, error: err.message ?? String(err) }, 500);
  }
}
