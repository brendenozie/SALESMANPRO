import crypto from "crypto";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const computed = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET!)
    .update(rawBody)
    .digest("hex");

  const signature = req.headers.get("x-paystack-signature");

  if (computed !== signature) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody);

  console.log("Paystack webhook:", event.event);

  return NextResponse.json({ ok: true });
}
