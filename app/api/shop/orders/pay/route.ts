import { withIdempotency } from "@/lib/idempotency";

export async function POST(req: Request) {
  const body = await req.json();
  const idempotencyKey = req.headers.get("Idempotency-Key");

  if (!idempotencyKey)
    return new Response("Idempotency-Key required", { status: 400 });

  const result = await withIdempotency(idempotencyKey, async () => {
    // Process Stripe, PayPal, M-Pesa etc.
    return { success: true, orderId: body.orderId };
  });

  return Response.json(result);
}
