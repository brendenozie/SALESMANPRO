import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import * as crypto from "crypto";

export async function POST(req: Request) {
  try {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const rawBody = await req.text();

    // Verify webhook signature
    const signature = req.headers.get("x-paystack-signature") || "";
    const expectedSignature = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("❌ Invalid Paystack signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const data = event.data;

    // Only handle successful charge events
    if (event.event === "charge.success") {
      const reference = String(data.reference || "");
      const amount = Number(data.amount || 0) / 100; // Convert from kobo/cents to currency units

      // Match order by reference, transactionReference, or metadata
      const order = await prisma.customerOrder.findFirst({
        where: {
          OR: [
            { trackingNumber: reference },
            { transactionReference: reference },
            data.metadata?.orderId ? { id: data.metadata.orderId } : undefined,
            data.metadata?.trackingNumber ? { trackingNumber: data.metadata.trackingNumber } : undefined,
          ].filter(Boolean) as any,
        },
      });

      if (order) {
        // Idempotency check
        if (order.paymentStatus !== "COMPLETED") {
          await prisma.$transaction(async (tx) => {
            await tx.customerOrder.update({
              where: { id: order.id },
              data: {
                paymentStatus: "COMPLETED",
                paymentMethod: (order.paymentMethod ?? "Paystack") as any,
                status: "PAID",
                transactionId: String(data.id || reference),
                transactionReference: reference,
                deliveryStatus: "Payment Received",
              },
            });

            await tx.payment.create({
              data: {
                userId: order.consumerId ?? order.companyId ?? "unknown",
                orderId: order.id,
                amount,
                status: "COMPLETED",
                transactionId: String(data.id || reference),
              },
            });
          });

          console.log(`✅ [PAYSTACK_WEBHOOK] Order ${order.trackingNumber || order.id} marked as PAID.`);
        }
      } else {
        console.warn(`⚠️ [PAYSTACK_WEBHOOK] Order not found for reference: ${reference}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
