import { jsonResponse } from "@/lib/apiResponse";
import { fetchWithTimeout } from "@/lib/fetchSafe";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    const { ghubaMerchantId, ghubaApiKey, ghubaEndpoint } = await req.json();
    // fallback to env
    const merchant = ghubaMerchantId ?? process.env.GHUBA_MERCHANT_ID;
    const key = ghubaApiKey ?? process.env.GHUBA_API_KEY;

    if (!merchant || !key) return jsonResponse({ ok: false, error: "Missing Ghuba credentials" }, 400);

    // If the host provides an endpoint, call it to validate; otherwise do simple format check
    if (ghubaEndpoint || process.env.GHUBA_ENDPOINT) {
      const url = ghubaEndpoint ?? process.env.GHUBA_ENDPOINT!;
      const res = await fetchWithTimeout(url.replace(/\/$/, "") + "/v1/merchant/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ merchantId: merchant }),
      }, 8000);

      if (!res.ok) return jsonResponse({ ok: false, status: res.status, data: res.data }, 401);
      return jsonResponse({ ok: true, data: res.data });
    }

    // simple local check (format)
    const ok = typeof key === "string" && key.length > 10;
    return jsonResponse({ ok, note: "No endpoint configured; format-check performed." });
  } catch (err: any) {
    Sentry.captureException(err);
    return jsonResponse({ ok: false, error: err.message ?? String(err) }, 500);
  }
}
