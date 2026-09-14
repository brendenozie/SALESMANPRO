import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import prisma from "@/server/db/prismadb";
import { syncAuthoritativePayment } from "@/lib/payments/syncPayment";
import { PaymentMethodType, PaymentStatus, OrderChannel } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    // Verify PayPal signature via PayPal verification API
    if (clientId && clientSecret && webhookId) {
      const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
      const baseUrl =
        process.env.PAYPAL_USE_SANDBOX === "true"
          ? "https://api-m.sandbox.paypal.com"
          : "https://api-m.paypal.com";

      const verifyRes = await fetch(
        `${baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auth_algo: req.headers.get("paypal-auth-algo"),
            cert_url: req.headers.get("paypal-cert-url"),
            transmission_id: req.headers.get("paypal-transmission-id"),
            transmission_sig: req.headers.get("paypal-transmission-sig"),
            transmission_time: req.headers.get("paypal-transmission-time"),
            webhook_id: webhookId,
            webhook_event: body,
          }),
        },
      );

      const verify = await verifyRes.json();
      if (verify.verification_status !== "SUCCESS") {
        console.error("❌ Invalid PayPal Webhook Signature", verify);
        return NextResponse.json(
          { ok: false, error: "Invalid PayPal Webhook Signature" },
          { status: 400 },
        );
      }
    }

    // Process event state reconciliation
    const eventType = body.event_type;
    const resource = body.resource;

    if (
      eventType === "PAYMENT.CAPTURE.COMPLETED" ||
      eventType === "CHECKOUT.ORDER.APPROVED"
    ) {
      const reference = resource.id;
      const customId = resource.custom_id || resource.invoice_id;
      const amount = Number(resource.amount?.value || 0);
      const currency = resource.amount?.currency_code || "USD";

      const order = await prisma.customerOrder.findFirst({
        where: {
          OR: [
            ...(customId ? [{ id: customId }, { trackingNumber: customId }] : []),
            { transactionReference: reference },
            { trackingNumber: reference },
          ],
        },
      });

      if (order) {
        await syncAuthoritativePayment({
          orderId: order.id,
          transactionId: reference,
          providerTransactionId: reference,
          internalReference: reference,
          amount,
          currency,
          provider: PaymentMethodType.PAYPAL,
          channel: order.channel || OrderChannel.WEBSITE,
          status: PaymentStatus.COMPLETED,
          companyId: order.companyId,
          metadata: resource,
          paidAt: new Date(),
        });
        console.log(
          `[PAYPAL_WEBHOOK_SUCCESS] Order #${order.trackingNumber ?? order.id} marked as PAID. Reference: ${reference}`,
        );
      }
    }

    return NextResponse.json({ ok: true, received: true });
  } catch (err: any) {
    Sentry.captureException(err);
    console.error("[PAYPAL_WEBHOOK_ERROR]:", err.message);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 400 },
    );
  }
}
