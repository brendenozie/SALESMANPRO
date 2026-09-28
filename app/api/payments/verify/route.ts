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


/**
 * Manual payment verification route
 * Examples:
 *  - /api/payments/verify?provider=paystack&reference=abc123
 *  - /api/payments/verify?provider=mpesa&checkoutRequestId=xyz456
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider");
    const reference = searchParams.get("reference"); // Paystack
    const checkoutRequestId = searchParams.get("checkoutRequestId"); // M-Pesa

    if (!provider) {
      return withCors(
        { success: false, message: "Missing provider (paystack/mpesa)" },
        400
      );
    }

    let result: any = null;

    const wantsJson =
      searchParams.get("format") === "json" ||
      searchParams.get("json") === "true" ||
      req.headers.get("accept")?.includes("application/json");

    const hostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const protoHeader = req.headers.get("x-forwarded-proto") || "https";
    const resolvedBaseUrl = hostHeader && !hostHeader.includes("localhost") && !hostHeader.includes("127.0.0.1")
      ? `${protoHeader}://${hostHeader}`
      : (process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === "production" ? "https://salesmanpro.site" : "http://localhost:3000"));

    /* -------------------------------------------------------------------------- */
    /*                              PAYSTACK VERIFICATION                         */
    /* -------------------------------------------------------------------------- */
    if (provider === "paystack") {
      if (!reference) {
        if (wantsJson) {
          return withCors({ success: false, message: "Missing Paystack reference" }, 400);
        }
        const failureUrl = new URL(`${resolvedBaseUrl}/subscription/failed`);
        failureUrl.searchParams.set("message", "Missing Paystack reference");
        return NextResponse.redirect(failureUrl);
      }

      const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
      if (!PAYSTACK_SECRET_KEY) {
        throw new Error("Missing Paystack secret key");
      }

      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok || !data.status) {
        if (wantsJson) {
          return withCors({ success: false, message: "Failed to verify Paystack payment", data }, 400);
        }
        const failureUrl = new URL(`${resolvedBaseUrl}/subscription/failed`);
        failureUrl.searchParams.set(
          "message",
          `Failed to verify Paystack payment: ${data.message || 'Unknown error'}`
        );
        return NextResponse.redirect(failureUrl);
      }

      const paymentStatus = data.data.status;
      const amount = data.data.amount / 100;
      const transactionId = data.data.id;
      const email = data.data.customer?.email || null;

      // Find order by trackingNumber, transactionReference, or transactionId
      const order = await prisma.customerOrder.findFirst({
        where: {
          OR: [
            { trackingNumber: reference },
            { transactionReference: reference },
            { transactionId: String(transactionId) },
          ],
        },
        include: {
          Company: { select: { id: true, slug: true } },
        },
      });

      if (!order) {
        if (wantsJson) {
          return withCors({ success: false, message: "Order not found for provided Paystack reference" }, 404);
        }
        const failureUrl = new URL(`${resolvedBaseUrl}/subscription/failed`);
        failureUrl.searchParams.set(
          "message",
          "Order not found for provided Paystack reference"
        );
        return NextResponse.redirect(failureUrl);
      }

      // If payment succeeded, update both order and payment records
      if (paymentStatus === "success") {
        await prisma.$transaction(async (tx) => {
          await tx.customerOrder.update({
            where: { id: order.id },
            data: {
              paymentStatus: "COMPLETED",
              paymentMethod: "PAYSTACK",
              transactionId: transactionId.toString(),
              transactionReference: reference,
              status: "PAID",
              deliveryStatus: "Payment Verified",
            },
          });

          await tx.payment.upsert({
            where: { transactionId: transactionId.toString() },
            update: {
              status: "COMPLETED",
              amount,
            },
            create: {
              userId: order.consumerId ?? order.Company?.id ?? "unknown",
              orderId: order.id,
              amount,
              status: "COMPLETED",
              transactionId: transactionId.toString(),
            },
          });
        });
      } else {
        await prisma.customerOrder.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED", status: "FAILED" },
        });
      }

      result = {
        provider: "paystack",
        status: paymentStatus,
        amount,
        orderTracking: order.trackingNumber,
        companySlug: order.Company?.slug ?? null,
      };
    }

    /* -------------------------------------------------------------------------- */
    /*                                M-PESA VERIFICATION                         */
    /* -------------------------------------------------------------------------- */
    else if (provider === "mpesa") {
      if (!checkoutRequestId) {
        if (wantsJson) {
          return withCors({ success: false, message: "Missing M-Pesa checkoutRequestId" }, 400);
        }
        const failureUrl = new URL(`${resolvedBaseUrl}/subscription/failed`);
        failureUrl.searchParams.set("message", "Missing M-Pesa checkoutRequestId");
        return NextResponse.redirect(failureUrl);
      }

      // Look up the order that was created during STK push
      const order = await prisma.customerOrder.findFirst({
        where: {
          OR: [
            { transactionReference: checkoutRequestId },
            { transactionId: checkoutRequestId },
            { trackingNumber: checkoutRequestId },
          ],
        },
        include: {
          Company: { select: { id: true, slug: true } },
        },
      });

      if (!order) {
        if (wantsJson) {
          return withCors({ success: false, message: "Order not found for provided CheckoutRequestID" }, 404);
        }
        const failureUrl = new URL(`${resolvedBaseUrl}/subscription/failed`);
        failureUrl.searchParams.set(
          "message",
          "Order not found for provided M-Pesa CheckoutRequestID"
        );
        return NextResponse.redirect(failureUrl);
      }

      result = {
        provider: "mpesa",
        status: order.paymentStatus,
        orderStatus: order.status,
        orderTracking: order.trackingNumber,
        companySlug: order.Company?.slug ?? null,
      };
    }

    /* -------------------------------------------------------------------------- */
    /*                                UNKNOWN PROVIDER                            */
    /* -------------------------------------------------------------------------- */
    else {
      if (wantsJson) {
        return withCors({ success: false, message: "Unsupported provider (use paystack or mpesa)" }, 400);
      }
      const failureUrl = new URL(`${resolvedBaseUrl}/subscription/failed`);
      failureUrl.searchParams.set("message", "Unsupported provider (use paystack or mpesa)");
      return NextResponse.redirect(failureUrl);
    }

    if (wantsJson) {
      return withCors({ success: true, data: result });
    }

    if (result.companySlug && result.orderTracking) {
      const storeSuccessUrl = new URL(
        `${resolvedBaseUrl}/site/${result.companySlug}/ecommerce/track`
      );
      storeSuccessUrl.searchParams.set("trackingNumber", result.orderTracking);
      return NextResponse.redirect(storeSuccessUrl);
    }

    const successUrl = new URL(`${resolvedBaseUrl}/subscription/success`);
    if (result.orderTracking) {
      successUrl.searchParams.set("trackingNumber", result.orderTracking);
    }
    return NextResponse.redirect(successUrl);
  } catch (error: any) {
    console.error("Payment verification error:", error);
    const failureUrl = new URL(`${resolvedBaseUrl}/subscription/failed`);
    failureUrl.searchParams.set("message", error.message || "Internal server error");
    return NextResponse.redirect(failureUrl);
  }
}

// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";

// /**
//  * Manual verification for Paystack and M-Pesa payments
//  * Example:
//  *  /api/payments/verify?provider=paystack&reference=abc123
//  *  /api/payments/verify?provider=mpesa&checkoutRequestId=xyz456
//  */

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const provider = searchParams.get("provider");
//     const reference = searchParams.get("reference");
//     const checkoutRequestId = searchParams.get("checkoutRequestId");

//     if (!provider) {
//       return NextResponse.json(
//         { success: false, message: "Missing provider (paystack/mpesa)" },
//         { status: 400 }
//       );
//     }

//     let result: any = null;

//     /* -------------------------------------------------------------------------- */
//     /*                              PAYSTACK VERIFICATION                         */
//     /* -------------------------------------------------------------------------- */
//     if (provider === "paystack") {
//       if (!reference) {
//         return NextResponse.json(
//           { success: false, message: "Missing Paystack reference" },
//           { status: 400 }
//         );
//       }

//       const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
//       if (!PAYSTACK_SECRET_KEY) {
//         throw new Error("Missing Paystack secret key");
//       }

//       const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//         },
//       });

//       const data = await response.json();
//       if (!response.ok || !data.status) {
//         return NextResponse.json(
//           { success: false, message: "Failed to verify Paystack payment", data },
//           { status: 400 }
//         );
//       }

//       const paymentStatus = data.data.status;
//       const order = await prisma.customerOrder.findFirst({
//         where: { trackingNumber: reference },
//       });

//       if (order && paymentStatus === "success") {
//         await prisma.customerOrder.update({
//           where: { id: order.id },
//           data: { status: "PAID", deliveryStatus: "Payment Verified" },
//         });
//       }

//       result = { provider: "paystack", status: paymentStatus, orderTracking: reference };
//     }

//     /* -------------------------------------------------------------------------- */
//     /*                                M-PESA VERIFICATION                         */
//     /* -------------------------------------------------------------------------- */
//     else if (provider === "mpesa") {
//       if (!checkoutRequestId) {
//         return NextResponse.json(
//           { success: false, message: "Missing M-Pesa checkoutRequestId" },
//           { status: 400 }
//         );
//       }

//       // (Optional) If you have your own M-Pesa verification service or DB record for STK Push
//       const order = await prisma.customerOrder.findFirst({
//         where: {
//           OR: [
//             { trackingNumber: { contains: checkoutRequestId } },
//             { paymentDetails: { contains: checkoutRequestId } },
//           ],
//         },
//       });

//       if (!order) {
//         return NextResponse.json(
//           { success: false, message: "Order not found for provided CheckoutRequestID" },
//           { status: 404 }
//         );
//       }

//       if (order.status === "PAID") {
//         result = { provider: "mpesa", status: "PAID", orderTracking: order.trackingNumber };
//       } else {
//         // You could implement real-time M-Pesa STK query here if Safaricom allows.
//         result = {
//           provider: "mpesa",
//           status: order.status,
//           message: "Status from local record (no direct query available)",
//           orderTracking: order.trackingNumber,
//         };
//       }
//     }

//     /* -------------------------------------------------------------------------- */
//     /*                                UNKNOWN PROVIDER                            */
//     /* -------------------------------------------------------------------------- */
//     else {
//       return NextResponse.json(
//         { success: false, message: "Unsupported provider (use paystack or mpesa)" },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json({ success: true, data: result });
//   } catch (error: any) {
//     console.error("Payment verification error:", error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }

// Verify payment manually
// async function verifyPayment(provider: "paystack" | "mpesa", id: string) {
//   const param = provider === "paystack" ? `reference=${id}` : `checkoutRequestId=${id}`;
//   const res = await fetch(`${apiBaseUrl}/payments/verify?provider=${provider}&${param}`);
//   const data = await res.json();
//   return data;
// }

// // Example (after payment redirect)
// const paymentResult = await verifyPayment("paystack", reference);
// if (paymentResult.success && paymentResult.data.status === "success") {
//   console.log("✅ Payment verified!");
// }
