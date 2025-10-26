import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

/**
 * Manual verification for Paystack and M-Pesa payments
 * Example:
 *  /api/payments/verify?provider=paystack&reference=abc123
 *  /api/payments/verify?provider=mpesa&checkoutRequestId=xyz456
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider");
    const reference = searchParams.get("reference");
    const checkoutRequestId = searchParams.get("checkoutRequestId");

    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Missing provider (paystack/mpesa)" },
        { status: 400 }
      );
    }

    let result: any = null;

    /* -------------------------------------------------------------------------- */
    /*                              PAYSTACK VERIFICATION                         */
    /* -------------------------------------------------------------------------- */
    if (provider === "paystack") {
      if (!reference) {
        return NextResponse.json(
          { success: false, message: "Missing Paystack reference" },
          { status: 400 }
        );
      }

      const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
      if (!PAYSTACK_SECRET_KEY) {
        throw new Error("Missing Paystack secret key");
      }

      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      const data = await response.json();
      if (!response.ok || !data.status) {
        return NextResponse.json(
          { success: false, message: "Failed to verify Paystack payment", data },
          { status: 400 }
        );
      }

      const paymentStatus = data.data.status;
      const order = await prisma.customerOrder.findFirst({
        where: { trackingNumber: reference },
      });

      if (order && paymentStatus === "success") {
        await prisma.customerOrder.update({
          where: { id: order.id },
          data: { status: "PAID", deliveryStatus: "Payment Verified" },
        });
      }

      result = { provider: "paystack", status: paymentStatus, orderTracking: reference };
    }

    /* -------------------------------------------------------------------------- */
    /*                                M-PESA VERIFICATION                         */
    /* -------------------------------------------------------------------------- */
    else if (provider === "mpesa") {
      if (!checkoutRequestId) {
        return NextResponse.json(
          { success: false, message: "Missing M-Pesa checkoutRequestId" },
          { status: 400 }
        );
      }

      // (Optional) If you have your own M-Pesa verification service or DB record for STK Push
      const order = await prisma.customerOrder.findFirst({
        where: {
          OR: [
            { trackingNumber: { contains: checkoutRequestId } },
            { paymentDetails: { contains: checkoutRequestId } },
          ],
        },
      });

      if (!order) {
        return NextResponse.json(
          { success: false, message: "Order not found for provided CheckoutRequestID" },
          { status: 404 }
        );
      }

      if (order.status === "PAID") {
        result = { provider: "mpesa", status: "PAID", orderTracking: order.trackingNumber };
      } else {
        // You could implement real-time M-Pesa STK query here if Safaricom allows.
        result = {
          provider: "mpesa",
          status: order.status,
          message: "Status from local record (no direct query available)",
          orderTracking: order.trackingNumber,
        };
      }
    }

    /* -------------------------------------------------------------------------- */
    /*                                UNKNOWN PROVIDER                            */
    /* -------------------------------------------------------------------------- */
    else {
      return NextResponse.json(
        { success: false, message: "Unsupported provider (use paystack or mpesa)" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Verify payment manually
// async function verifyPayment(provider: "paystack" | "mpesa", id: string) {
//   const param = provider === "paystack" ? `reference=${id}` : `checkoutRequestId=${id}`;
//   const res = await fetch(`/api/payments/verify?provider=${provider}&${param}`);
//   const data = await res.json();
//   return data;
// }

// // Example (after payment redirect)
// const paymentResult = await verifyPayment("paystack", reference);
// if (paymentResult.success && paymentResult.data.status === "success") {
//   console.log("✅ Payment verified!");
// }
