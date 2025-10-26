import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

/**
 * Safaricom sends callback JSON after STK Push (success/failure)
 * Example:
 * {
 *   "Body": {
 *     "stkCallback": {
 *       "MerchantRequestID": "...",
 *       "CheckoutRequestID": "...",
 *       "ResultCode": 0,
 *       "ResultDesc": "The service request is processed successfully.",
 *       "CallbackMetadata": {
 *         "Item": [
 *           { "Name": "Amount", "Value": 100.00 },
 *           { "Name": "MpesaReceiptNumber", "Value": "NLJ7RT61SV" },
 *           { "Name": "PhoneNumber", "Value": 2547XXXXXXXX }
 *         ]
 *       }
 *     }
 *   }
 * }
 */

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const stkCallback = payload?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ message: "No STK callback found" }, { status: 400 });
    }

    const { ResultCode, ResultDesc, CheckoutRequestID } = stkCallback;

    // Lookup order by CheckoutRequestID (stored during STK initiation)
    const order = await prisma.customerOrder.findFirst({
      where: { trackingNumber: { contains: CheckoutRequestID } },
    });

    if (!order) {
      console.warn("⚠️ M-Pesa callback: Order not found for CheckoutRequestID", CheckoutRequestID);
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (ResultCode === 0) {
      // Extract transaction data
      const metadata = stkCallback.CallbackMetadata?.Item || [];
      const amountItem = metadata.find((i: any) => i.Name === "Amount");
      const receiptItem = metadata.find((i: any) => i.Name === "MpesaReceiptNumber");
      const phoneItem = metadata.find((i: any) => i.Name === "PhoneNumber");

      const paymentDetails = {
        amount: amountItem?.Value || 0,
        receipt: receiptItem?.Value || "UNKNOWN",
        phone: phoneItem?.Value || "UNKNOWN",
      };

      // Mark order as paid
      await prisma.customerOrder.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          deliveryStatus: "Payment Received",
          paymentOption: "mpesa",
          paymentDetails: JSON.stringify(paymentDetails),
        },
      });

      console.log(`✅ M-Pesa payment success for order ${order.trackingNumber}`);
    } else {
      // Payment failed
      await prisma.customerOrder.update({
        where: { id: order.id },
        data: {
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
