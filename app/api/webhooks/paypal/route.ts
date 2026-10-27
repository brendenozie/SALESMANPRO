import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import prisma from "@/server/db/prismadb";
import { syncAuthoritativePayment } from "@/lib/payments/syncPayment";
import { PaymentMethodType, PaymentStatus, OrderChannel } from "@prisma/client";
import { NotificationService } from "@/lib/notifications/notificationService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET || process.env.PAYPAL_CLIENT_SECRET;
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

    // Helper to guard MongoDB ObjectID format
    const isMongoId = (str?: string | null): boolean => Boolean(str && /^[0-9a-fA-F]{24}$/.test(str));

    if (eventType === "CHECKOUT.ORDER.APPROVED") {
      const reference = resource.id;
      const customId = resource.custom_id || resource.invoice_id || resource.purchase_units?.[0]?.reference_id;

      const order = await prisma.customerOrder.findFirst({
        where: {
          OR: [
            ...(customId ? [...(isMongoId(customId) ? [{ id: customId }] : []), { trackingNumber: customId }] : []),
            { transactionReference: reference },
            { trackingNumber: reference },
          ],
        },
      });

      if (order && order.paymentStatus !== "COMPLETED") {
        await prisma.customerOrder.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PENDING",
            deliveryStatus: "Authorized - Pending Capture",
            notes: `${order.notes || ""} [PayPal Order Approved: Awaiting Capture. Ref: ${reference}]`.trim(),
          },
        });
        console.log(
          `[PAYPAL_WEBHOOK_AUTHORIZED] Order #${order.trackingNumber ?? order.id} authorized. Awaiting capture. Reference: ${reference}`,
        );
      }
      return NextResponse.json({ ok: true, received: true, status: "AUTHORIZED" });
    }

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const reference = resource.id;
      const customId = resource.custom_id || resource.invoice_id || resource.purchase_units?.[0]?.reference_id;
      const amount = Number(resource.amount?.value || resource.purchase_units?.[0]?.amount?.value || 0);
      const currency = resource.amount?.currency_code || resource.purchase_units?.[0]?.amount?.currency_code || "USD";

      const order = await prisma.customerOrder.findFirst({
        where: {
          OR: [
            ...(customId ? [...(isMongoId(customId) ? [{ id: customId }] : []), { trackingNumber: customId }] : []),
            { transactionReference: reference },
            { trackingNumber: reference },
          ],
        },
      });

      if (order) {
        // Prevent underpayment completion
        const expected = Number(order.totalFinalPrice ?? order.totalPrice ?? 0);
        if (expected > 0 && amount < expected - 1) {
          await prisma.customerOrder.update({
            where: { id: order.id },
            data: {
              paymentStatus: PaymentStatus.PENDING,
              notes: `${order.notes || ""} [PayPal Underpayment: Received ${currency} ${amount}, Expected ${expected}]`.trim(),
            },
          });

          if (order.companyId) {
            NotificationService.publishEvent({
              title: "PayPal Underpayment",
              message: `PayPal underpayment detected for Order #${order.trackingNumber || order.id.slice(-6)}. Received ${currency} ${amount}, Expected ${expected}.`,
              eventType: "PAYMENT_FAILED",
              severity: "WARNING",
              companyId: order.companyId,
              actionUrl: `/admin/orders?orderId=${order.id}`,
              resourceType: "payment",
              resourceId: reference,
              recipientPolicy: {
                type: "STORE_STAFF",
              },
              channels: ["IN_APP", "PUSH_ANDROID", "PUSH_DESKTOP"],
              idempotencyKey: `pay_${reference}_underpayment`,
            }).catch((notifErr) => {
              console.warn("[paypalWebhook] Underpayment notification error:", notifErr?.message || notifErr);
            });
          }

          return NextResponse.json({ ok: false, error: "Underpayment detected" }, { status: 400 });
        }

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
          `[PAYPAL_WEBHOOK_SUCCESS] Order #${order.trackingNumber ?? order.id} marked as PAID via PAYMENT.CAPTURE.COMPLETED. Reference: ${reference}`,
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
