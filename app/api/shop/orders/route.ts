import { NextResponse } from "next/server";
import { unifiedOrderSchema } from "@/lib/orders/orderSchemas";
import { createOrder } from "@/lib/orders/centralizedCreateOrder";
import { processOrderPayment } from "@/lib/orders/processOrderPayment";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": [
    "Content-Type",
    "Authorization",
    "cache-control",
    "x-api-key",
    "X-Requested-With",
    "Accept",
    "Idempotency-Key",
  ].join(", "),
  "Access-Control-Max-Age": "86400",
};

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: CORS_HEADERS,
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export const POST = withApiHandler(
  async (req) => {
    try {
      const incoming = await req.json();

      /**
       * --------------------------------------------------
       * NORMAL SHOP ORDER NORMALIZATION
       * --------------------------------------------------
       */
      const normalized = {
        ...incoming,
        orderType: incoming.orderType ?? "PRODUCT",
        source: incoming.source ?? "WEBSITE",
        items: Array.isArray(incoming.items)
          ? incoming.items.map((item: any) => ({
              marketplaceListingId: item.marketplaceListingId ?? item.listingId,
              quantity: item.quantity ?? 1,
              /**
               * Informational only. Server pricing overrides this.
               */
              price: item.price,
              totalPrice: item.totalPrice ?? item.subtotal ?? item.subTotal,
              selectedOptions: item.selectedOptions ?? item.variants ?? [],
              date: item.date ?? null,
              timeSlot: item.timeSlot ?? null,
              serviceNotes: item.serviceNotes ?? null,
              productId: item.productId,
              appointmentId: item.appointmentId,
            }))
          : [],
      };

      const parsed = unifiedOrderSchema.safeParse(normalized);

      if (!parsed.success) {
        return response(
          {
            success: false,
            error: "Validation failed",
            details: parsed.error.flatten(),
          },
          400,
        );
      }

      const data = parsed.data;

      /**
       * --------------------------------------------------
       * CREATE ORDER (CENTRALIZED SERVICE)
       * --------------------------------------------------
       */
      const result = await createOrder({
        companyId: data.companyId,
        consumerId: data.consumerId,
        orderType: data.orderType,
        orderSource: data.source,
        name: data.name,
        email: data.email,
        phone: data.phone,
        mpesaPhone: data.mpesaPhone,
        paymentOption: data.paymentOption,
        items: data.items,
        shippingAddress: data.shippingAddress,
        shippingMethod: data.shippingMethod,
        promoCode: data.promoCode,
        notes: data.notes,
        trackingNumber: data.trackingNumber,
        idempotencyKey: data.idempotencyKey,
        metadata: {
          ...(data.metadata ?? {}),
          channel: "SHOP",
          paymentData: data.paymentData,
        },
      });

      /**
       * --------------------------------------------------
       * PAYMENT PROCESSING
       * --------------------------------------------------
       */
      const payment = await processOrderPayment({
        order: result.order,
        companyId: data.companyId,
        paymentOption: data.paymentOption,
        email: data.email,
        phone: data.phone,
        mpesaPhone: data.mpesaPhone,
        paymentData: data.paymentData,
      });

      return response(
        {
          success: true,
          message: result.alreadyExists
            ? "Existing order returned."
            : "Order created successfully.",
          data: {
            order: result.order,
            pricing: result.pricing,
            trackingNumber: result.trackingNumber,
            payment,
            authorizationUrl: payment?.authorizationUrl ?? null,
            checkoutRequestId: (payment as any)?.checkoutRequestId ?? null,
            alreadyExists: result.alreadyExists,
          },
        },
        result.alreadyExists ? 200 : 201,
      );
    } catch (error: any) {
      console.error("[SHOP_ORDER_ERROR]", error);

      return response(
        {
          success: false,
          error: error?.message ?? "Failed to create order.",
        },
        500,
      );
    }
  },
  {
    requireAuth: false,
    requireRateLimit: true,
  },
);
