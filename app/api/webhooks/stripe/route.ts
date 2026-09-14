import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import prisma from "@/server/db/prismadb";
import { syncAuthoritativePayment } from "@/lib/payments/syncPayment";
import { PaymentMethodType, PaymentStatus, OrderChannel } from "@prisma/client";

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

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const reference = paymentIntent.id;
        const metadata = paymentIntent.metadata || {};
        const amountInUnits = paymentIntent.amount / 100;
        const currency = paymentIntent.currency?.toUpperCase() || "USD";

        // Locate order by tracking reference or metadata.orderId
        const order = await prisma.customerOrder.findFirst({
          where: {
            OR: [
              ...(metadata.orderId ? [{ id: metadata.orderId }] : []),
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

        const order = await prisma.customerOrder.findFirst({
          where: {
            OR: [
              ...(metadata.orderId ? [{ id: metadata.orderId }] : []),
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
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        const reference = session.payment_intent as string || session.id;
        const amountInUnits = (session.amount_total || 0) / 100;

        if (orderId) {
          const order = await prisma.customerOrder.findUnique({
            where: { id: orderId },
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
