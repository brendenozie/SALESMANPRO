import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Call PayPal verify endpoint
    const res = await fetch(
      (process.env.PAYPAL_USE_SANDBOX === "true"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com") + "/v1/notifications/verify-webhook-signature",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_algo: req.headers.get("paypal-auth-algo"),
          cert_url: req.headers.get("paypal-cert-url"),
          transmission_id: req.headers.get("paypal-transmission-id"),
          transmission_sig: req.headers.get("paypal-transmission-sig"),
          transmission_time: req.headers.get("paypal-transmission-time"),
          webhook_id: process.env.PAYPAL_WEBHOOK_ID!,
          webhook_event: body,
        }),
      }
    );

    const verify = await res.json();
    if (verify.verification_status !== "SUCCESS") {
      throw new Error("Invalid PayPal Webhook Signature");
    }

    // Process event
    console.log("PayPal webhook:", body.event_type);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    Sentry.captureException(err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
