import { NextResponse } from "next/server";
import { z } from "zod";

import { createUnifiedOrder } from "@/lib/orders/unifiedOrderService";

import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";

import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";

import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";

import { initiatePaystackPayment as initiateGhubaPayment } from "@/lib/payments/paystack";

import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";

import { createPaypalOrder } from "@/lib/paymentsv2/paypal";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",

  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

function jsonResponse(data: unknown, status = 200) {
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

const serviceItemSchema = z.object({
  marketplaceListingId: z.string().min(1),

  listingId: z.string().optional(),

  quantity: z.number().int().positive(),

  price: z.number().optional(),

  totalPrice: z.number().optional(),

  date: z.string().nullable().optional(),

  timeSlot: z.string().nullable().optional(),

  serviceNotes: z.string().nullable().optional(),

  selectedOptions: z
    .array(
      z.object({
        category: z.string(),

        name: z.string(),

        extraPrice: z.number().nonnegative().optional(),
      }),
    )
    .optional(),

  variants: z
    .array(
      z.object({
        category: z.string(),

        name: z.string(),

        extraPrice: z.number().nonnegative().optional(),
      }),
    )
    .optional(),
});

const serviceSchema = z.object({
  name: z.string().min(1),

  email: z.string().email(),

  phone: z.string().min(1),

  mpesaPhone: z.string().optional(),

  consumerId: z.string().nullable().optional(),

  companyId: z.string().min(1),

  paymentOption: z
    .enum([
      "cod",
      "pickupatshop",
      "mpesa",
      "card",
      "paystack",
      "ghuba",
      "stripe",
      "paypal",
      "cash",
      "split",
      "pending",
    ])
    .default("cod"),

  items: z.array(serviceItemSchema).min(1),

  appointment: z
    .object({
      date: z.string().optional(),

      timeSlot: z.string().optional(),

      locationType: z.string().optional(),

      provider: z.string().optional(),
    })
    .optional(),

  serviceNotes: z.string().optional(),

  notes: z.string().optional(),

  promoCode: z.string().optional(),

  shippingAddress: z.record(z.string(), z.any()).optional(),

  shippingMethod: z.string().optional(),

  paymentData: z.record(z.string(), z.any()).optional(),

  idempotencyKey: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  try {
    const incoming = await req.json();

    const parsed = serviceSchema.safeParse(incoming);

    if (!parsed.success) {
      return jsonResponse(
        {
          success: false,

          error: parsed.error.flatten(),
        },

        400,
      );
    }

    const data = parsed.data;

    /**
     * Normalize service items.
     *
     * We deliberately do not use
     * incoming price/totalPrice.
     */
    const items = data.items.map((item) => ({
      marketplaceListingId: item.marketplaceListingId || item.listingId!,

      quantity: item.quantity,

      date: item.date ?? data.appointment?.date ?? null,

      timeSlot: item.timeSlot ?? data.appointment?.timeSlot ?? null,

      serviceNotes: item.serviceNotes ?? data.serviceNotes ?? null,

      selectedOptions: item.selectedOptions ?? item.variants ?? [],
    }));

    /**
     * Unified service order creation.
     */
    const result = await createUnifiedOrder({
      orderType: "SERVICE",

      companyId: data.companyId,

      consumerId: data.consumerId,

      name: data.name,

      email: data.email,

      phone: data.phone,

      mpesaPhone: data.mpesaPhone,

      paymentOption: data.paymentOption,

      items,

      shippingAddress: data.shippingAddress,

      shippingMethod: data.shippingMethod,

      promoCode: data.promoCode,

      notes: data.notes ?? data.serviceNotes,

      paymentData: {
        ...(data.paymentData ?? {}),

        locationType: data.appointment?.locationType,

        provider: data.appointment?.provider,

        appointmentDate: data.appointment?.date,

        appointmentTime: data.appointment?.timeSlot,
      },

      idempotencyKey: data.idempotencyKey,

      delivery: false,
    });

    let paymentResponse: any = null;

    /**
     * Payment gateway processing.
     */
    if (
      ["mpesa", "paystack", "ghuba", "stripe", "paypal", "card"].includes(
        data.paymentOption,
      )
    ) {
      const cfg = await getCompanyPaymentConfig(data.companyId);

      if (!cfg?.credentials) {
        return jsonResponse(
          {
            success: false,

            error: "Payment gateway configuration is missing.",
          },

          500,
        );
      }

      switch (data.paymentOption) {
        case "mpesa": {
          const phone = data.mpesaPhone ?? data.phone;

          paymentResponse = await initiateMpesaPayment(
            result.order,
            phone,
            cfg.credentials,
          );

          break;
        }

        case "paystack":
        case "card": {
          paymentResponse = await initiatePaystackPayment(
            result.order,
            data.email,
            cfg.credentials,
            "",
          );

          break;
        }

        case "ghuba": {
          paymentResponse = await initiateGhubaPayment(
            result.order,
            data.email,
          );

          break;
        }

        case "stripe": {
          paymentResponse = await initiateStripePaymentIntent(
            result.order,
            cfg.credentials,
          );

          break;
        }

        case "paypal": {
          paymentResponse = await createPaypalOrder(
            result.order,
            cfg.credentials,
          );

          break;
        }
      }
    }

    /**
     * Cash/POS.
     */
    if (["cash", "split"].includes(data.paymentOption)) {
      const prisma = (await import("@/server/db/prismadb")).default;

      await prisma.customerOrder.update({
        where: {
          id: result.order.id,
        },

        data: {
          paymentStatus: "COMPLETED",

          status: "PAID",
        },
      });

      paymentResponse = {
        success: true,

        message: "Service payment recorded.",
      };
    }

    /**
     * Deferred payment.
     */
    if (["cod", "pending", "pickupatshop"].includes(data.paymentOption)) {
      paymentResponse = {
        success: true,

        message: "Service booking recorded with deferred payment.",
      };
    }

    return jsonResponse(
      {
        success: true,

        data: {
          order: result.order,

          orderType: result.orderType,

          pricing: result.pricing,

          trackingNumber: result.trackingNumber,

          paymentResponse,

          authorizationUrl:
            paymentResponse?.data?.authorization_url ??
            paymentResponse?.authorization_url ??
            null,
        },
      },

      201,
    );
  } catch (error: any) {
    console.error("[SERVICE_ORDER_API_ERROR]", error);

    return jsonResponse(
      {
        success: false,

        error: error?.message ?? "Failed to create service order.",
      },

      500,
    );
  }
}
