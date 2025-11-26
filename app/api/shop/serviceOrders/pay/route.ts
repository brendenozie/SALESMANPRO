import { withIdempotency } from "@/lib/idempotency";
import { NextResponse } from "next/server";

// ---------------------------
// GLOBAL CORS HEADERS
// ---------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

// ---------------------------
// OPTIONS (PRE-FLIGHT)
// ---------------------------
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}


export async function POST(req: Request) {
  const body = await req.json();
  const idempotencyKey = req.headers.get("Idempotency-Key");

  if (!idempotencyKey)
    return withCors({ error: "Idempotency-Key required" }, 400);

  const result = await withIdempotency(idempotencyKey, async () => {
    // Process Stripe, PayPal, M-Pesa etc.
    return { success: true, orderId: body.orderId };
  });

  return withCors(result);
}
