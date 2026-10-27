import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import prisma from "@/server/db/prismadb";
import { syncAuthoritativePayment } from "@/lib/payments/syncPayment";
import { PaymentMethodType, PaymentStatus, OrderChannel } from "@prisma/client";
import { NotificationService } from "@/lib/notifications/notificationService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    console.error("[STRIPE_WEBHOOK_CONFIG_ERROR] Stripe credentials missing");
    return NextResponse.json(
      { error: "Stripe webhook configuration unavailable." },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20" as any,
  });

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("[STRIPE_SIGNATURE_VERIFY_ERROR]:", err.message);
    return NextResponse.json(
      { error: `Invalid webhook signature: ${err.message}` },
      { status: 400 },
    );
  }

  // Helper to guard MongoDB ObjectID format
  const isMongoId = (str?: string | null): boolean => Boolean(str && /^[0-9a-fA-F]{24}$/.test(str));

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const reference = paymentIntent.id;
        const metadata = paymentIntent.metadata || {};
        const amountInUnits = paymentIntent.amount / 100;
        const currency = paymentIntent.currency?.toUpperCase() || "USD";

        const targetOrderId = metadata.orderId || metadata.order_id;
        // Locate order by tracking reference or metadata orderId / order_id
        const order = await prisma.customerOrder.findFirst({
          where: {
            OR: [
              ...(targetOrderId
                ? [
                    ...(isMongoId(targetOrderId) ? [{ id: targetOrderId }] : []),
                    { trackingNumber: targetOrderId },
                  ]
                : []),
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
            amount: amountInUnits,
            currency,
            provider: PaymentMethodType.STRIPE,
            channel: order.channel || OrderChannel.WEBSITE,
            status: PaymentStatus.COMPLETED,
            companyId: order.companyId,
            metadata: paymentIntent as any,
            paidAt: new Date(),
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const reference = paymentIntent.id;
        const metadata = paymentIntent.metadata || {};

        const targetId = metadata.orderId || metadata.order_id;
        const order = await prisma.customerOrder.findFirst({
          where: {
            OR: [
              ...(targetId
                ? [
                    ...(isMongoId(targetId) ? [{ id: targetId }] : []),
                    { trackingNumber: targetId },
                  ]
                : []),
              { transactionReference: reference },
              { trackingNumber: reference },
            ],
          },
        });

        if (order && order.paymentStatus !== "COMPLETED") {
          await prisma.customerOrder.update({
            where: { id: order.id },
            data: {
              paymentStatus: "FAILED",
              deliveryStatus: "Payment Failed",
            },
          });

          if (order.companyId) {
            NotificationService.publishEvent({
              title: "Card Payment Failed",
              message: `Stripe card payment failed for Order #${order.trackingNumber || order.id.slice(-6)}.`,
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
              idempotencyKey: `pay_${reference}_failed`,
            }).catch((notifErr) => {
              console.warn("[stripeWebhook] Payment failed notification error:", notifErr?.message || notifErr);
            });
          }
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status !== "paid") {
          console.log(`[STRIPE_WEBHOOK_INFO] Checkout session completed but payment_status is '${session.payment_status}'. Deferring final settlement.`);
          break;
        }

        const targetOrderId = session.metadata?.orderId || session.metadata?.order_id;
        const reference = (session.payment_intent as string) || session.id;
        const amountInUnits = (session.amount_total || 0) / 100;

        const order = await prisma.customerOrder.findFirst({
          where: {
            OR: [
              ...(targetOrderId
                ? [
                    ...(isMongoId(targetOrderId) ? [{ id: targetOrderId }] : []),
                    { trackingNumber: targetOrderId },
                  ]
                : []),
              { transactionReference: session.id },
              { transactionReference: reference },
              { trackingNumber: session.id },
            ],
          },
        });

        if (order) {
            await syncAuthoritativePayment({
              orderId: order.id,
              transactionId: reference,
              providerTransactionId: reference,
              internalReference: session.id,
              amount: amountInUnits,
              currency: session.currency?.toUpperCase() || "USD",
              provider: PaymentMethodType.STRIPE,
              channel: order.channel || OrderChannel.WEBSITE,
              status: PaymentStatus.COMPLETED,
              companyId: order.companyId,
              metadata: session as any,
              paidAt: new Date(),
            });
          }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (processError: any) {
    Sentry.captureException(processError);
    console.error("[STRIPE_WEBHOOK_PROCESSING_ERROR]", processError);
    return NextResponse.json(
      { error: "Webhook event processing failure" },
      { status: 500 },
    );
  }
}
