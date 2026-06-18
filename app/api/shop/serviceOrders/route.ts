// app/api/service/orders/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/server/db/prismadb";
import { createOrder as createOrderRecord } from "@/lib/orders/createOrder";
import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";
// import { initiateGhubaPayment } from "@/lib/paymentsv2/ghuba";
import { initiatePaystackPayment as initiateGhubaPayment } from "@/lib/payments/paystack";
import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";
import { createPaypalOrder } from "@/lib/paymentsv2/paypal";

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

// ---------------------------
// SERVICE ORDER SCHEMA
// ---------------------------
const serviceOrderSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  mpesaPhone: z.string().optional(),
  consumerId: z.string(),
  paymentOption: z.enum([
    "cod",
    "pickupatshop",
    "mpesa",
    "card",
    "paystack",
    "ghuba",
    "stripe",
    "paypal",
  ]).default("cod"),
  items: z.array(
    z.object({
      marketplaceListingId: z.string(),
      date: z.string().optional(),
      timeSlot: z.string().optional(),
      quantity: z.number().positive(),
      price: z.number().positive(),
      serviceNotes: z.string().optional(), // extra notes per service
    })
  ),
  trackingNumber: z.string().optional(),
  totalPrice: z.number().positive(),
  totalFinalPrice: z.number().optional(),
  shippingAddress: z.any().optional(),
  shippingMethod: z.string().optional(),
  companyId: z.string().optional(),
  paymentData: z.any().optional(), // promoCode, notes, other custom fields
});

function generateTrackingNumber() {
  return `TRK${Math.floor(100000 + Math.random() * 900000)}`;
}

// ---------------------------
// POST: CREATE SERVICE ORDER
// ---------------------------
export async function POST(req: Request) {
  try {
    
    const incoming = await req.json();

    // Transform incoming → expected schema
    const merged = {
      name: incoming.billing.name,
      email: incoming.billing.email,
      phone: incoming.billing.phone,
      consumerId: incoming.consumerId,
      paymentOption: incoming.paymentOption,
      totalPrice: incoming.totalPrice,
      totalFinalPrice: incoming.totalPrice,

      items: [
        {
          marketplaceListingId: incoming.listingId,
          date: incoming.appointment?.date,
          timeSlot: incoming.appointment?.timeSlot,
          quantity: 1,
          price: incoming.price,
          serviceNotes: incoming.serviceName
        }
      ],

      paymentData: {
        promoCode: incoming.promoCode || null,
        locationType: incoming.appointment?.locationType,
        provider: incoming.appointment?.provider
      }
    };
    const parsed = serviceOrderSchema.safeParse(merged);

    if (!parsed.success) {
      return withCors({ success: false, error: parsed.error.flatten() }, 400);
    }

    const data = parsed.data;
    const trackingNumber = data.trackingNumber ?? generateTrackingNumber();

    // CREATE ORDER RECORD
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
      promoCode: data.paymentData?.promoCode,
      trackingNumber,
      deliveryStatus: "Order Placed",
      delivery: false,
      notes: data.paymentData?.notes,
    });

    // PAYMENT PROCESSING
    let paymentResponse: any = null;
    const cfg = await getCompanyPaymentConfig(data.companyId);

    switch (data.paymentOption) {
      case "mpesa": {
        const phoneNumber = data.paymentData?.mpesaPhone ?? data.mpesaPhone ?? data.phone;
        if (!phoneNumber) return withCors({ success: false, error: "mpesaPhone required" }, 400);
        paymentResponse = await initiateMpesaPayment(orderDb, phoneNumber, cfg.credentials);
        break;
      }
      case "paystack":
        paymentResponse = await initiatePaystackPayment(orderDb, data.email, cfg.credentials, "");
        break;
      case "ghuba":
        // paymentResponse = await initiateGhubaPayment(orderDb, cfg.credentials);
        paymentResponse = await initiateGhubaPayment(orderDb, data.email);
        break;
      case "stripe":
        paymentResponse = await initiateStripePaymentIntent(orderDb, cfg.credentials);
        break;
      case "paypal":
        paymentResponse = await createPaypalOrder(orderDb, cfg.credentials);
        break;
      case "cod":
      case "pickupatshop":
        paymentResponse = { message: "Payment on delivery or pickup confirmed." };
        await prisma.customerOrder.update({
          where: { id: orderDb.id },
          data: { paymentStatus: "PENDING" },
        });
        break;
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
    console.error("Service order creation failed:", err);
    return withCors({ success: false, error: err?.message ?? String(err) }, 500);
  }
}
