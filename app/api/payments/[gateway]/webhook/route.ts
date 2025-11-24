// app/api/payments/[gateway]/webhook/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

/**
 * Webhook receiver. Each provider will POST here. You should:
 *  - verify signature (where available),
 *  - find the related order (by reference, metadata),
 *  - update order paymentStatus / status / providerRef,
 *  - respond 200 quickly.
 *
 * This file is a simple stub that supports paystack/mpesa/ghuba/stripe/paypal events.
 */

export async function POST(req: Request, { params }: { params: { gateway: string } }) {
  const gateway = params.gateway;
  const bodyText = await req.text();
  let payload: any = {};
  try {
    payload = JSON.parse(bodyText);
  } catch {
    // not JSON maybe form-encoded - leave as text
  }

  try {
    switch (gateway) {
      case "paystack": {
        // TODO: verify signature via x-paystack-signature header if configured
        // Example: find by reference: payload.data.reference
        const reference = payload?.data?.reference ?? payload?.reference;
        if (reference) {
          // Example: locate order with metadata.trackingNumber or provider reference
          const order = await prisma.customerOrder.findFirst({ where: { trackingNumber: reference } });
          if (order && payload?.event === "charge.success") {
            await prisma.customerOrder.update({ where: { id: order.id }, data: { paymentStatus: "PAID", provider: "paystack", providerRef: payload?.data?.reference } });
          }
        }
        return NextResponse.json({ ok: true });
      }

      case "mpesa": {
        // Safaricom will POST results to your callback URL; payload structure depends on your API
        const checkoutRequestID = payload?.Body?.stkCallback?.CheckoutRequestID ?? payload?.CheckoutRequestID;
        if (checkoutRequestID) {
          // find order by metadata or account ref; this is a stub
          // mark order paid if resultCode === 0
          const resultCode = payload?.Body?.stkCallback?.ResultCode ?? payload?.ResultCode;
          if (resultCode === 0) {
            // TODO: find order and update
          }
        }
        return NextResponse.json({ ok: true });
      }

      case "ghuba": {
        // Verify signature header if Ghuba provides one
        // Find by metadata.orderId or trackingNumber and update paymentStatus
        return NextResponse.json({ ok: true });
      }

      case "stripe": {
        // Verify stripe signature with process.env.STRIPE_WEBHOOK_SECRET
        // For now, accept and return 200
        return NextResponse.json({ ok: true });
      }

      case "paypal": {
        // Verify via PayPal webhook verification API if needed
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ ok: false, message: "Unknown provider" }, { status: 404 });
    }
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}
