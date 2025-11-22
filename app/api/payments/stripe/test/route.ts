import { jsonResponse } from "@/lib/apiResponse";
import { fetchWithTimeout } from "@/lib/fetchSafe";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const secret = body.stripeSecretKey ?? process.env.STRIPE_SECRET;
    if (!secret) return jsonResponse({ ok: false, error: "Missing Stripe secret key" }, 400);

    // Use Stripe Account endpoint for validation
    const url = "https://api.stripe.com/v1/account";
    const res = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
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
