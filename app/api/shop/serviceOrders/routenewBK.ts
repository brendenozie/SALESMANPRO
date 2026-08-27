import { NextResponse } from "next/server";

import { normalizedOrderSchema } from "@/lib/orders/orderSchemas";

import { processOrder } from "@/lib/orders/processOrder";
import { calculateOrderPricing } from "@/lib/pricing";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function jsonResponse(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

function normalizeServicePayload(incoming: any) {
  const items = Array.isArray(incoming.items)
    ? incoming.items
    : [
        {
          marketplaceListingId:
            incoming.listingId ?? incoming.marketplaceListingId,

          date: incoming.appointment?.date ?? incoming.date ?? null,

          timeSlot: incoming.appointment?.timeSlot ?? incoming.timeSlot ?? null,

          quantity: Number(incoming.quantity ?? 1),

          price: Number(incoming.price ?? incoming.totalPrice ?? 0),

          totalPrice: Number(
            incoming.totalPrice ??
              incoming.subtotal ??
              Number(incoming.price ?? 0) * Number(incoming.quantity ?? 1),
          ),

          selectedOptions: incoming.selectedOptions ?? incoming.variants ?? [],

          serviceNotes: incoming.serviceNotes ?? incoming.serviceName ?? null,
        },
      ];

  const normalizedItems = items.map((item: any) => ({
    marketplaceListingId: item.marketplaceListingId ?? item.listingId,

    date: item.date ?? incoming.appointment?.date ?? null,

    timeSlot: item.timeSlot ?? incoming.appointment?.timeSlot ?? null,

    quantity: Number(item.quantity ?? 1),

    price: Number(item.price ?? 0),

    totalPrice: Number(
      item.totalPrice ??
        item.subtotal ??
        item.subTotal ??
        Number(item.price ?? 0) * Number(item.quantity ?? 1),
    ),

    selectedOptions: item.selectedOptions ?? item.variants ?? [],

    serviceNotes: item.serviceNotes ?? incoming.serviceNotes ?? null,

    productId: item.productId ?? null,
  }));

  const calculatedTotal = normalizedItems.reduce(
    (sum: number, item: any) => sum + item.totalPrice,
    0,
  );

  return {
    companyId: incoming.companyId ?? normalizedItems?.[0]?.companyId ?? null,

    consumerId: incoming.consumerId ?? null,

    name: incoming.billing?.name ?? incoming.name ?? incoming.customer?.name,

    email:
      incoming.billing?.email ?? incoming.email ?? incoming.customer?.email,

    phone:
      incoming.billing?.phone ?? incoming.phone ?? incoming.customer?.phone,

    mpesaPhone:
      incoming.mpesaPhone ??
      incoming.billing?.mpesaPhone ??
      incoming.paymentData?.mpesaPhone ??
      null,

    paymentOption: incoming.paymentOption ?? "cod",

    items: normalizedItems,

    totalPrice: Number(incoming.totalPrice ?? calculatedTotal),

    totalFinalPrice:
      incoming.totalFinalPrice != null
        ? Number(incoming.totalFinalPrice)
        : Number(incoming.totalPrice ?? calculatedTotal),

    shippingAddress: incoming.shippingAddress ?? incoming.address ?? null,

    shippingMethod: incoming.shippingMethod ?? null,

    paymentData: {
      ...(incoming.paymentData ?? {}),

      promoCode: incoming.promoCode ?? incoming.paymentData?.promoCode ?? null,

      locationType:
        incoming.appointment?.locationType ??
        incoming.paymentData?.locationType ??
        null,

      provider:
        incoming.appointment?.provider ??
        incoming.paymentData?.provider ??
        null,

      appointmentDate: incoming.appointment?.date ?? null,

      appointmentTime:
        incoming.appointment?.timeSlot ?? incoming.appointment?.time ?? null,

      notes:
        incoming.notes ??
        incoming.serviceNotes ??
        incoming.paymentData?.notes ??
        null,
    },

    trackingNumber: incoming.trackingNumber ?? null,

    idempotencyKey: incoming.idempotencyKey ?? null,

    orderSource: incoming.orderSource ?? "WEBSITE",

    isServiceOrder: true,
  };
}

export async function POST(req: Request) {
  try {
    const incoming = await req.json();
    
    const pricing = await calculateOrderPricing({
      companyId: incoming.companyId,
      items: incoming.items.map((item: any) => ({
        marketplaceListingId: item.marketplaceListingId,

        quantity: item.quantity,

        date: item.date,

        timeSlot: item.timeSlot,

        selectedOptions: item.selectedOptions ?? [],

        serviceNotes: item.serviceNotes,
      })),

      shippingMethod: incoming.shippingMethod,

      shippingAddress: incoming.shippingAddress,

      promoCode: incoming.paymentData?.promoCode,
    });

    const normalized = normalizeServicePayload(pricing);

    const parsed = normalizedOrderSchema.safeParse(normalized);

    if (!parsed.success) {
      return jsonResponse(
        {
          success: false,
          error: parsed.error.flatten(),
        },
        400,
      );
    }

    const result = await processOrder({
      ...parsed.data,
      isServiceOrder: true,
    });

    return jsonResponse(
      {
        success: true,

        data: {
          order: result.order,

          trackingNumber: result.trackingNumber,

          paymentResponse: result.paymentResponse,

          authorizationUrl: result.authorizationUrl,

          paymentStatus: result.paymentStatus,

          orderStatus: result.orderStatus,

          isServiceOrder: result.isServiceOrder,
        },
      },
      201,
    );
  } catch (error: any) {
    console.error("[SERVICE_ORDER_API_ERROR]", error);

    return jsonResponse(
      {
        success: false,
        error: error?.message ?? "Failed to create service order",
      },
      400,
    );
  }
}
