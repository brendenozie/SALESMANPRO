import crypto from "crypto";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import prisma from "@/server/db/prismadb";
import { syncAuthoritativePayment } from "@/lib/payments/syncPayment";
import { PaymentMethodType, PaymentStatus, OrderChannel } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const secret = process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY || "";

    const computed = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    const signature = req.headers.get("x-paystack-signature");

    if (computed !== signature) {
      return new NextResponse("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const data = event.data;
      const reference = data.reference;
      const amountInUnits = Number(data.amount) / 100;
      const feeInUnits = data.fees ? Number(data.fees) / 100 : 0;

      // Locate corresponding order by reference or metadata
      const order = await prisma.customerOrder.findFirst({
        where: {
          OR: [
            { trackingNumber: reference },
            { transactionReference: reference },
            ...(data.metadata?.orderId ? [{ id: data.metadata.orderId }] : []),
          ],
        },
      });

      if (order) {
        await syncAuthoritativePayment({
          orderId: order.id,
          transactionId: String(data.id || reference),
          providerTransactionId: String(data.id),
          internalReference: reference,
          amount: amountInUnits,
          feeAmount: feeInUnits,
          currency: data.currency || "KES",
          provider: PaymentMethodType.PAYSTACK,
          channel: order.channel || OrderChannel.WEBSITE,
          status: PaymentStatus.COMPLETED,
          companyId: order.companyId,
          metadata: data,
          paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    Sentry.captureException(err);
    console.error("[PAYSTACK_WEBHOOK_ERROR]", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
