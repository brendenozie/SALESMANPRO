// app/api/shop/orders/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/server/db/prismadb";
import { createOrder  as createOrderRecord } from "@/lib/orders/createOrder";// your createOrder helper path
import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";
// import { initiateGhubaPayment } from "@/lib/paymentsv2/ghuba"; defaulto paystack for ghuba temporarily
import { initiatePaystackPayment as initiateGhubaPayment } from "@/lib/payments/paystack";
import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";
import { createPaypalOrder } from "@/lib/paymentsv2/paypal";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// ---------------------------
// GLOBAL CORS HEADERS
// ---------------------------
// const CORS_HEADERS = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers":
//   "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
// };
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Or your specific desktop app origin
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With, Accept, cache-control",
  "Access-Control-Max-Age": "86400",
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
// export function OPTIONS() {
//   return new NextResponse(null, {
//     status: 204,
//     headers: CORS_HEADERS,
//   });
// }

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204, // 204 No Content is standard for preflight responses
    headers: {
      "Access-Control-Allow-Origin": "*", // Or '*' for testing
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

/* Order schema - mirrors your existing schema (light validation) */
const orderSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  mpesaPhone: z.string().optional(),
  consumerId: z.string(),
  paymentOption: z.enum(["cod", "pickupatshop", "mpesa", "card", "paystack", "ghuba", "stripe", "paypal"]).default("cod"),
  items: z.array(
    z.object({
      marketplaceListingId: z.string(),
      date: z.string().optional(),
      timeSlot: z.string().optional(),
      quantity: z.number().positive(),
      price: z.number().positive(),
    })
  ),
  trackingNumber: z.string().optional(),
  totalPrice: z.number().positive(),
  totalFinalPrice: z.number().optional(),
  shippingAddress: z.any().optional(),
  shippingMethod: z.string().optional(),
  companyId: z.string().optional(),
  paymentData: z.any().optional(),
});

function generateTrackingNumber() {
  return `TRK${Math.floor(100000 + Math.random() * 900000).toString()}`;
}

// export async function POST(req: Request) {
export const POST = withApiHandler(async (req) => {
  try {

    if (req.method === "OPTIONS") {
      return NextResponse.next();
    }

    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return withCors({ success: false, error: parsed.error.flatten() }, 400);
    }

    const data = parsed.data;
    const trackingNumber = data.trackingNumber ?? generateTrackingNumber();

    const orderDb = await createOrderRecord({
      consumerId: data.consumerId,
      items: data.items,
      totalPrice: data.totalPrice,
      totalFinalPrice: data.totalFinalPrice ?? data.totalPrice,
      mpesaPhone: data.mpesaPhone,
      paymentOption: data.paymentOption,
      shippingAddress: data.shippingAddress,
      shippingMethod: data.shippingMethod,
      name: data.name,
      email: data.email,
      phone: data.phone,
      promoCode: data.paymentData?.promoCode ?? undefined,
      trackingNumber,
      deliveryStatus: "Order Placed",
      delivery: false,
      notes: data.paymentData?.notes ?? undefined,
    });

    let paymentResponse = null;
    const cfg = await getCompanyPaymentConfig(data.companyId);

    switch (data.paymentOption) {
      case "mpesa": {
        const phoneNumber = data.paymentData?.mpesaPhone ?? data.mpesaPhone ?? data.phone;
        if (!phoneNumber) return withCors({ success: false, error: "mpesaPhone required" }, 400);
        paymentResponse = await initiateMpesaPayment(orderDb, phoneNumber, cfg.credentials);
        break;
      }
      case "paystack": {
        paymentResponse = await initiatePaystackPayment(orderDb, data.email, cfg.credentials);
        break;
      }
      case "ghuba": {
        // paymentResponse = await initiateGhubaPayment(orderDb, cfg.credentials);
        paymentResponse = await initiateGhubaPayment(orderDb, body.email);
        break;
      }
      case "stripe": {
        paymentResponse = await initiateStripePaymentIntent(orderDb, cfg.credentials);
        break;
      }
      case "paypal": {
        paymentResponse = await createPaypalOrder(orderDb, cfg.credentials);
        break;
      }
      case "cod":
      case "pickupatshop": {
        paymentResponse = { message: "Payment on delivery or pickup confirmed." };
        // mark paymentStatus accordingly if you want
        await prisma.customerOrder.update({ where: { id: orderDb.id }, data: { paymentStatus: "PENDING" } });
        break;
      }
      default:
        paymentResponse = { message: "Unknown payment option" };
    }

    return withCors({
      success: true,
      data: {
        order: orderDb,
        trackingNumber,
        paymentResponse,
        authorizationUrl: paymentResponse?.data?.authorization_url ?? paymentResponse?.authorization_url ?? null,
      },
    });
  } catch (err: any) {
    console.error("Order creation failed:", err);
    return withCors({ success: false, error: err?.message ?? String(err) }, 500);
  }
});
