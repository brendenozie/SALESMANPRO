import { NextResponse } from "next/server";
import { z } from "zod";

import { normalizedOrderSchema } from "@/lib/orders/orderSchemas";

import { processOrder } from "@/lib/orders/processOrder";

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { calculateOrderPricing } from "@/lib/pricing";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With, Accept, cache-control, x-api-key",
};

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

function withCors(response: NextResponse) {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * Supports:
 *
 * 1. Normal website checkout
 * 2. Mobile checkout
 * 3. Future WhatsApp normalized checkout
 */
function normalizeCheckoutPayload(incoming: any) {
  return {
    companyId: incoming.companyId ?? incoming.items?.[0]?.companyId ?? null,

    consumerId: incoming.consumerId ?? null,

    name: incoming.name ?? incoming.billing?.name ?? incoming.customer?.name,

    email:
      incoming.email ?? incoming.billing?.email ?? incoming.customer?.email,

    phone:
      incoming.phone ?? incoming.billing?.phone ?? incoming.customer?.phone,

    mpesaPhone:
      incoming.mpesaPhone ??
      incoming.billing?.mpesaPhone ??
      incoming.paymentData?.mpesaPhone ??
      null,

    paymentOption: incoming.paymentOption ?? "cod",

    items: Array.isArray(incoming.items)
      ? incoming.items.map((item: any) => ({
          marketplaceListingId: item.marketplaceListingId ?? item.listingId,

          date: item.date ?? null,

          timeSlot: item.timeSlot ?? null,

          quantity: Number(item.quantity ?? 1),

          price: Number(item.price ?? 0),

          totalPrice: Number(
            item.totalPrice ??
              item.subtotal ??
              item.subTotal ??
              Number(item.price ?? 0) * Number(item.quantity ?? 1),
          ),

          selectedOptions: item.selectedOptions ?? item.variants ?? [],

          serviceNotes: item.serviceNotes ?? null,

          productId: item.productId ?? null,
        }))
      : [],

    totalPrice: Number(
      incoming.totalPrice ?? incoming.subtotal ?? incoming.total ?? 0,
    ),

    totalFinalPrice:
      incoming.totalFinalPrice != null
        ? Number(incoming.totalFinalPrice)
        : undefined,

    shippingAddress: incoming.shippingAddress ?? incoming.address ?? null,

    shippingMethod: incoming.shippingMethod ?? null,

    paymentData: {
      ...(incoming.paymentData ?? {}),

      promoCode: incoming.promoCode ?? incoming.paymentData?.promoCode ?? null,

      notes: incoming.notes ?? incoming.paymentData?.notes ?? null,
    },

    trackingNumber: incoming.trackingNumber ?? null,

    idempotencyKey: incoming.idempotencyKey ?? null,

    orderSource: incoming.orderSource ?? "WEBSITE",

    isServiceOrder: false,
  };
}

export const POST = withApiHandler(
  async (req) => {
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

      const normalized = normalizeCheckoutPayload(pricing);

      const parsed = normalizedOrderSchema.safeParse(normalized);

      if (!parsed.success) {
        const errors = parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));

        return withCors(
          formatResponse(
            false,
            {
              errors,
            },
            "Validation failed",
            400,
          ),
        );
      }

      const result = await processOrder({
        ...parsed.data,
        isServiceOrder: false,
      });

      return withCors(
        formatResponse(
          true,
          {
            order: result.order,

            trackingNumber: result.trackingNumber,

            paymentResponse: result.paymentResponse,

            authorizationUrl: result.authorizationUrl,

            paymentStatus: result.paymentStatus,

            orderStatus: result.orderStatus,
          },
          "Order created successfully",
          201,
        ),
      );
    } catch (error: any) {
      console.error("[SHOP_ORDER_API_ERROR]", error);

      const status = error?.message?.includes("already exists") ? 409 : 400;

      return withCors(
        formatResponse(
          false,
          null,
          error?.message ?? "Failed to create order",
          status,
        ),
      );
    }
  },
  {
    requireAuth: false,
    requireRateLimit: true,
  },
);
