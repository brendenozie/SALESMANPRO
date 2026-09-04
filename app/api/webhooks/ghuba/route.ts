import crypto from "crypto";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import prisma from "@/server/db/prismadb";
import { syncAuthoritativePayment } from "@/lib/payments/syncPayment";
import { PaymentMethodType, PaymentStatus, OrderChannel } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const apiKey = process.env.GHUBA_API_KEY || "";
    const sentSig = req.headers.get("x-ghuba-signature");

    if (apiKey) {
      const expected = crypto
        .createHmac("sha256", apiKey)
        .update(raw)
        .digest("hex");

      if (sentSig && sentSig !== expected) {
        return new NextResponse("Invalid Ghuba webhook signature", { status: 400 });
      }
    }

    const event = JSON.parse(raw);

    // Support both event format and payload format
    const eventType = event.type || event.event;
    const payload = event.data || event.payload || event;

    if (eventType === "payment.success" || eventType === "charge.success") {
      const orderId = payload.orderId || payload.metadata?.orderId;
      const reference = payload.reference || payload.trackingNumber;
      const amount = Number(payload.amount || 0);

      const order = await prisma.customerOrder.findFirst({
        where: {
          OR: [
            ...(orderId ? [{ id: orderId }] : []),
            ...(reference ? [{ trackingNumber: reference }, { transactionReference: reference }] : []),
          ],
        },
      });

      if (order) {
        await syncAuthoritativePayment({
          orderId: order.id,
          transactionId: String(payload.transactionId || payload.id || reference || order.id),
          providerTransactionId: String(payload.transactionId || payload.id || reference),
          internalReference: reference || order.trackingNumber || order.id,
          amount: amount > 0 ? amount : Number(order.totalFinalPrice ?? order.totalPrice ?? 0),
          currency: payload.currency || "KES",
          provider: PaymentMethodType.GHUBA,
          channel: OrderChannel.WEBSITE,
          status: PaymentStatus.COMPLETED,
          companyId: order.companyId,
          metadata: payload,
          paidAt: payload.paidAt ? new Date(payload.paidAt) : new Date(),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    Sentry.captureException(err);
    console.error("[GHUBA_WEBHOOK_ERROR]", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
