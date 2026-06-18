import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/server/db/prismadb";
import { createOrder as createOrderRecord } from "@/lib/orders/createOrder";
import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";
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
      serviceNotes: z.string().optional(),
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
  return `TRK${Math.floor(100000 + Math.random() * 900000)}`;
}

// ---------------------------
// POST: CREATE SERVICE ORDER
// ---------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { gateway: string } },
) {
  let incoming : any;

  try {
    incoming = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid or missing request body" },
      { status: 400 },
    );
  }

  try{

    // Safe defensive data merging with fallbacks supporting structured or flat checkouts
    const merged = {
      name: incoming.billing?.name || incoming.name,
      email: incoming.billing?.email || incoming.email,
      phone: incoming.billing?.phone || incoming.phone,
      mpesaPhone: incoming.mpesaPhone || incoming.billing?.mpesaPhone || null,
      consumerId: incoming.consumerId,
      paymentOption: incoming.paymentOption,
      totalPrice: incoming.totalPrice ?? incoming.price ?? 0,
      totalFinalPrice: incoming.totalFinalPrice ?? incoming.totalPrice ?? incoming.price ?? 0,
      companyId: incoming.companyId || incoming.items?.[0]?.companyId || null,

      items: incoming.items || [
        {
          marketplaceListingId: incoming.listingId || incoming.marketplaceListingId,
          date: incoming.appointment?.date || incoming.date,
          timeSlot: incoming.appointment?.timeSlot || incoming.timeSlot,
          quantity: incoming.quantity || 1,
          price: incoming.price,
          serviceNotes: incoming.serviceName || incoming.serviceNotes
        }
      ],

      paymentData: {
        promoCode: incoming.promoCode || null,
        locationType: incoming.appointment?.locationType || null,
        provider: incoming.appointment?.provider || null,
        notes: incoming.notes || incoming.paymentData?.notes || null
      }
    };

    const parsed = serviceOrderSchema.safeParse(merged);

    if (!parsed.success) {
      return withCors({ success: false, error: parsed.error.flatten() }, 400);
    }

    const data = parsed.data;
    const trackingNumber = data.trackingNumber ?? generateTrackingNumber();

    // CREATE ORDER RECORD WITH COMPANY METADATA ATTACHED
    const orderDb = await createOrderRecord({
      companyId: data.companyId,
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

    // GATEWAY PROVISIONING VIA COMPANY CONFIG
    let paymentResponse: any = null;
    const cfg = await getCompanyPaymentConfig(data.companyId);

    switch (data.paymentOption) {
      case "mpesa": {
        const phoneNumber = data.mpesaPhone || data.phone;
        if (!phoneNumber) return withCors({ success: false, error: "mpesaPhone or phone context missing" }, 400);
        paymentResponse = await initiateMpesaPayment(orderDb, phoneNumber, cfg.credentials);
        break;
      }
      case "paystack":
        paymentResponse = await initiatePaystackPayment(orderDb, data.email, cfg.credentials);
        break;
      case "ghuba":
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