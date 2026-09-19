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
       * SERVICE CHECKOUT NORMALIZATION
       * --------------------------------------------------
       */
      const billing = incoming.billing ?? {};
      const appointment = incoming.appointment ?? {};

      const rawItems = Array.isArray(incoming.items)
        ? incoming.items
        : [
            {
              marketplaceListingId:
                incoming.listingId ?? incoming.marketplaceListingId,
              quantity: incoming.quantity ?? 1,
              price: incoming.price,
              serviceNotes:
                incoming.serviceNotes ?? incoming.serviceName ?? null,
              date: incoming.date ?? appointment.date ?? null,
              timeSlot: incoming.timeSlot ?? appointment.timeSlot ?? null,
              selectedOptions:
                incoming.selectedOptions ?? incoming.variants ?? [],
            },
          ];

      const normalized = {
        name: billing.name ?? incoming.name,
        email: billing.email ?? incoming.email,
        phone: billing.phone ?? incoming.phone,
        mpesaPhone: incoming.mpesaPhone ?? billing.mpesaPhone ?? undefined,
        consumerId: incoming.consumerId,
        companyId: incoming.companyId ?? rawItems?.[0]?.companyId ?? undefined,
        orderType: "SERVICE",
        source: incoming.source ?? "WEBSITE",
        paymentOption: incoming.paymentOption ?? "cod",
        posSessionId: incoming.posSessionId,
        operatorId: incoming.operatorId,
        cashierName: incoming.cashierName,
        items: rawItems.map((item: any) => ({
          marketplaceListingId: item.marketplaceListingId ?? item.listingId,
          quantity: Number(item.quantity ?? 1),
          price: item.price != null ? Number(item.price) : undefined,
          totalPrice: item.totalPrice ?? item.subtotal ?? item.subTotal,
          date: item.date ?? appointment.date ?? null,
          timeSlot: item.timeSlot ?? appointment.timeSlot ?? null,
          selectedOptions: item.selectedOptions ?? item.variants ?? [],
          serviceNotes:
            item.serviceNotes ??
            incoming.serviceNotes ??
            incoming.serviceName ??
            null,
          appointmentId: item.appointmentId ?? incoming.appointmentId,
        })),
        shippingAddress: incoming.shippingAddress ?? incoming.address ?? null,
        shippingMethod: incoming.shippingMethod ?? undefined,
        promoCode: incoming.promoCode ?? undefined,
        notes: incoming.notes ?? incoming.serviceNotes ?? undefined,
        trackingNumber: incoming.trackingNumber ?? undefined,
        idempotencyKey: incoming.idempotencyKey ?? undefined,
        paymentData: incoming.paymentData ?? {
          locationType: appointment.locationType,
          provider: appointment.provider,
          serviceName: incoming.serviceName,
          notes: incoming.serviceNotes,
        },
        metadata: {
          appointment,
          serviceName: incoming.serviceName,
          channel: "SERVICE",
        },
      };

      // Server-side enforcement: Services require identifiable customer details
      if (!normalized.name || normalized.name.trim().toLowerCase() === "walk-in customer" && !normalized.phone) {
        return response(
          {
            success: false,
            error: "Customer required: Please select or create an identifiable customer before booking a service.",
          },
          400
        );
      }

      /**
       * --------------------------------------------------
       * VALIDATE
       * --------------------------------------------------
       */
      const parsed = unifiedOrderSchema.safeParse(normalized);

      if (!parsed.success) {
        return response(
          {
            success: false,
            error: "Service order validation failed",
            details: parsed.error.flatten(),
          },
          400,
        );
      }

      const data = parsed.data;

      /**
       * --------------------------------------------------
       * UNIFIED CREATE ORDER
       * --------------------------------------------------
       */
      const result = await createOrder({
        companyId: data.companyId,
        consumerId: data.consumerId,
        orderType: "SERVICE",
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
        posSessionId: data.posSessionId,
        operatorId: data.operatorId,
        cashierName: data.cashierName,
        metadata: {
          ...(data.metadata ?? {}),
          appointment,
          paymentData: data.paymentData,
          serviceName: incoming.serviceName,
          channel: "SERVICE",
        },
      });

      /**
       * --------------------------------------------------
       * PAYMENT
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
            ? "Existing service order returned."
            : "Service order created successfully.",
          data: {
            order: result.order,
            pricing: result.pricing,
            trackingNumber: result.trackingNumber,
            payment,
            appointment,
            orderType: "SERVICE",
            alreadyExists: result.alreadyExists,
          },
        },
        result.alreadyExists ? 200 : 201,
      );
    } catch (error: any) {
      console.error("[SERVICE_ORDER_ERROR]", error);

      return response(
        {
          success: false,
          error: error?.message ?? "Failed to create service order.",
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
