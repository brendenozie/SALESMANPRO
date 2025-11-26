
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

// ---------------------------
// GLOBAL CORS HEADERS
// ---------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function withCors(json: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new NextResponse(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

// ---------------------------
// OPTIONS (PRE-FLIGHT)
// ---------------------------
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 M-Pesa Callback Received:", JSON.stringify(body, null, 2));

    const stk = body?.Body?.stkCallback;
    if (!stk) {
      return withCors({ message: "Invalid M-Pesa callback body" }, 400);
    }

    const { CheckoutRequestID, MerchantRequestID, ResultCode, ResultDesc } = stk;

    // Find corresponding order
    const order = await prisma.customerOrder.findFirst({
      where: {
        OR: [
          { trackingNumber: CheckoutRequestID },
          { transactionReference: MerchantRequestID },
        ],
      },
    });

    if (!order) {
      console.warn("⚠️ Callback for unknown order:", CheckoutRequestID);
      return withCors({ message: "Order not found" }, 404);
    }

    // Prevent duplicate callbacks
    if (order.paymentStatus === "COMPLETED") {
      return withCors({ success: true, message: "Already processed" });
    }

    // SUCCESSFUL PAYMENT
    if (ResultCode === 0) {
      const meta = stk.CallbackMetadata?.Item || [];

      const amount = meta.find((x: { Name: string; Value?: number }) => x.Name === "Amount")?.Value ?? 0;
      const receipt = meta.find((x: { Name: string; Value?: string }) => x.Name === "MpesaReceiptNumber")?.Value ?? "";
      const phone = meta.find((x: { Name: string; Value?: string }) => x.Name === "PhoneNumber")?.Value ?? "";

      // Create payment record
      await prisma.payment.create({
        data: {
          userId: order.consumerId,
          orderId: order.id,
          amount,
          status: "COMPLETED",
          transactionId: receipt,
        },
      });

      // Update order
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

      console.log("✅ Payment Successful:", receipt);

      return withCors({ success: true });
    }

    // FAILED PAYMENT
    await prisma.customerOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus: "FAILED",
        status: "FAILED",
        deliveryStatus: "Payment Failed",
      },
    });

    console.log("❌ Payment Failed:", ResultDesc);

    return withCors({ success: true });
  } catch (err) {
    console.error("🔥 Callback Handler Error:", err);
    return withCors({ error: "Server error" }, 500);
  }
}

// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";

// export async function POST(req: Request) {
//   try {
//     const payload = await req.json();
//     const stkCallback = payload?.Body?.stkCallback;

//     if (!stkCallback) {
//       return NextResponse.json({ message: "No STK callback found" }, { status: 400 });
//     }

//     const { ResultCode, ResultDesc, CheckoutRequestID } = stkCallback;

//     // 1️⃣ Lookup order using CheckoutRequestID (stored in trackingNumber or transactionReference)
//     const order = await prisma.customerOrder.findFirst({
//       where: {
//         OR: [
//           { trackingNumber: CheckoutRequestID },
//           { transactionReference: CheckoutRequestID },
//         ],
//       },
//     });

//     if (!order) {
//       console.warn("⚠️ M-Pesa callback: Order not found for CheckoutRequestID", CheckoutRequestID);
//       return NextResponse.json({ message: "Order not found" }, { status: 404 });
//     }

//     // 2️⃣ Handle success or failure
//     if (ResultCode === 0) {
//       // Extract metadata
//       const metadata = stkCallback.CallbackMetadata?.Item || [];
//       const amountItem = metadata.find((i: any) => i.Name === "Amount");
//       const receiptItem = metadata.find((i: any) => i.Name === "MpesaReceiptNumber");
//       const phoneItem = metadata.find((i: any) => i.Name === "PhoneNumber");

//       const amount = amountItem?.Value || 0;
//       const receipt = receiptItem?.Value || "UNKNOWN";
//       const phone = phoneItem?.Value || "UNKNOWN";

//       // 3️⃣ Create Payment record linked to order & user
//       await prisma.payment.create({
//         data: {
//           userId: order.consumerId, // from your schema
//           orderId: order.id,
//           amount,
//           status: "COMPLETED",
//           transactionId: receipt, // MpesaReceiptNumber
//         },
//       });

//       // 4️⃣ Update order payment and delivery details
//       await prisma.customerOrder.update({
//         where: { id: order.id },
//         data: {
//           paymentStatus: "COMPLETED",
//           paymentMethod: "M-Pesa",
//           transactionId: receipt,
//           transactionReference: CheckoutRequestID,
//           transactionDate: new Date(),
//           mpesaPhone: phone,
//           deliveryStatus: "Payment Received",
//           status: "COMPLETED",
//         },
//       });

//       console.log(`✅ M-Pesa payment success for order ${order.trackingNumber}`);
//     } else {
//       // 5️⃣ Payment failed
//       await prisma.customerOrder.update({
//         where: { id: order.id },
//         data: {
//           paymentStatus: "FAILED",
//           status: "FAILED",
//           deliveryStatus: "Payment Failed",
//         },
//       });

//       console.warn(`❌ M-Pesa payment failed for order ${order.trackingNumber}: ${ResultDesc}`);
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("M-Pesa callback error:", error);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
