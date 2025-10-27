import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const stkCallback = payload?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ message: "No STK callback found" }, { status: 400 });
    }

    const { ResultCode, ResultDesc, CheckoutRequestID } = stkCallback;

    // 1️⃣ Lookup order using CheckoutRequestID (stored in trackingNumber or transactionReference)
    const order = await prisma.customerOrder.findFirst({
      where: {
        OR: [
          { trackingNumber: CheckoutRequestID },
          { transactionReference: CheckoutRequestID },
        ],
      },
    });

    if (!order) {
      console.warn("⚠️ M-Pesa callback: Order not found for CheckoutRequestID", CheckoutRequestID);
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // 2️⃣ Handle success or failure
    if (ResultCode === 0) {
      // Extract metadata
      const metadata = stkCallback.CallbackMetadata?.Item || [];
      const amountItem = metadata.find((i: any) => i.Name === "Amount");
      const receiptItem = metadata.find((i: any) => i.Name === "MpesaReceiptNumber");
      const phoneItem = metadata.find((i: any) => i.Name === "PhoneNumber");

      const amount = amountItem?.Value || 0;
      const receipt = receiptItem?.Value || "UNKNOWN";
      const phone = phoneItem?.Value || "UNKNOWN";

      // 3️⃣ Create Payment record linked to order & user
      await prisma.payment.create({
        data: {
          userId: order.consumerId, // from your schema
          orderId: order.id,
          amount,
          status: "COMPLETED",
          transactionId: receipt, // MpesaReceiptNumber
        },
      });

      // 4️⃣ Update order payment and delivery details
      await prisma.customerOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: "COMPLETED",
          paymentMethod: "M-Pesa",
          transactionId: receipt,
          transactionReference: CheckoutRequestID,
          transactionDate: new Date(),
          mpesaPhone: phone,
          deliveryStatus: "Payment Received",
          status: "COMPLETED",
        },
      });

      console.log(`✅ M-Pesa payment success for order ${order.trackingNumber}`);
    } else {
      // 5️⃣ Payment failed
      await prisma.customerOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
          status: "FAILED",
          deliveryStatus: "Payment Failed",
        },
      });

      console.warn(`❌ M-Pesa payment failed for order ${order.trackingNumber}: ${ResultDesc}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
