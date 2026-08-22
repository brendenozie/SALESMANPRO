import { NextResponse } from "next/server";
import { z } from "zod";

import { createUnifiedOrder } from "@/lib/orders/unifiedOrderService";

import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";

import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";

import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";

import { initiatePaystackPayment as initiateGhubaPayment } from "@/lib/payments/paystack";

import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";

import { createPaypalOrder } from "@/lib/paymentsv2/paypal";

import { withApiHandler } from "@/lib/hooks/withApiHandler";

import { formatResponse } from "@/lib/formatResponse";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",

  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With, Accept, cache-control",
};

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

const orderItemSchema = z.object({
  marketplaceListingId: z.string().min(1),

  quantity: z.number().int().positive(),

  /**
   * Compatibility fields.
   *
   * They are intentionally NOT used
   * for final pricing.
   */
  price: z.number().optional(),

  totalPrice: z.number().optional(),

  date: z.string().nullable().optional(),

  timeSlot: z.string().nullable().optional(),

  serviceNotes: z.string().nullable().optional(),

  selectedOptions: z
    .array(
      z.object({
        category: z.string().min(1),

        name: z.string().min(1),

        extraPrice: z.number().nonnegative().optional(),
      }),
    )
    .optional(),
});

const orderSchema = z.object({
  name: z.string().min(1),

  email: z.string().email(),

  phone: z.string().min(1),

  mpesaPhone: z.string().optional(),

  consumerId: z.string().optional().nullable(),

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

  items: z.array(orderItemSchema).min(1),

  shippingAddress: z.record(z.string(), z.any()).optional(),

  shippingMethod: z.string().optional(),

  promoCode: z.string().optional(),

  notes: z.string().optional(),

  paymentData: z.record(z.string(), z.any()).optional(),

  idempotencyKey: z.string().uuid().optional(),

  callbackUrl: z.string().url().optional(),
});

export const POST = withApiHandler(
  async (req) => {
    try {
      const body = await req.json();

      const parsed = orderSchema.safeParse(body);

      if (!parsed.success) {
        return formatResponse(
          false,
          null,
          parsed.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", "),
          400,
        );
      }

      const data = parsed.data;

      /**
       * Create order using the unified
       * server-side pricing engine.
       */
      const result = await createUnifiedOrder({
        orderType: "PRODUCT",

        companyId: data.companyId,

        consumerId: data.consumerId,

        name: data.name,

        email: data.email,

        phone: data.phone,

        mpesaPhone: data.mpesaPhone,

        paymentOption: data.paymentOption,

        items: data.items,

        shippingAddress: data.shippingAddress,

        shippingMethod: data.shippingMethod,

        promoCode: data.promoCode,

        notes: data.notes ?? data.paymentData?.notes,

        paymentData: data.paymentData,

        idempotencyKey: data.idempotencyKey,
      });

      const order = result.order;

      let paymentResponse: any = null;

      /**
       * Gateway payments.
       */
      if (
        ["mpesa", "paystack", "ghuba", "stripe", "paypal", "card"].includes(
          data.paymentOption,
        )
      ) {
        const cfg = await getCompanyPaymentConfig(data.companyId);

        if (!cfg?.credentials) {
          return formatResponse(
            false,
            null,
            "Payment gateway configuration is missing for this store.",
            500,
          );
        }

        switch (data.paymentOption) {
          case "mpesa": {
            const phone =
              data.paymentData?.mpesaPhone ?? data.mpesaPhone ?? data.phone;

            paymentResponse = await initiateMpesaPayment(
              order,
              phone,
              cfg.credentials,
            );

            break;
          }

          case "paystack":
          case "card": {
            paymentResponse = await initiatePaystackPayment(
              order,
              data.email,
              cfg.credentials,
              "",
            );

            break;
          }

          case "ghuba": {
            paymentResponse = await initiateGhubaPayment(order, data.email);

            break;
          }

          case "stripe": {
            paymentResponse = await initiateStripePaymentIntent(
              order,
              cfg.credentials,
            );

            break;
          }

          case "paypal": {
            paymentResponse = await createPaypalOrder(order, cfg.credentials);

            break;
          }
        }
      }

      /**
       * POS / deferred payments.
       */
      if (["cash", "split"].includes(data.paymentOption)) {
        paymentResponse = {
          success: true,

          message: `POS payment via ${data.paymentOption} recorded.`,

          breakdown: data.paymentData?.paymentBreakdown ?? [],
        };
      }

      if (["cash", "split"].includes(data.paymentOption)) {
        const prisma = (await import("@/server/db/prismadb")).default;

        await prisma.customerOrder.update({
          where: {
            id: order.id,
          },

          data: {
            paymentStatus: "COMPLETED",

            status: "PAID",
          },
        });
      }

      /**
       * Deferred collection.
       */
      if (["pending", "cod", "pickupatshop"].includes(data.paymentOption)) {
        paymentResponse = {
          success: true,

          message: "Order recorded for deferred payment.",
        };
      }

      const authorizationUrl =
        paymentResponse?.data?.authorization_url ??
        paymentResponse?.authorization_url ??
        null;

      const response = formatResponse(
        true,
        {
          order: result.order,

          orderType: result.orderType,

          pricing: result.pricing,

          trackingNumber: result.trackingNumber,

          paymentResponse,

          authorizationUrl,
        },

        "Order created successfully",

        201,
      );

      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error: any) {
      console.error("[UNIFIED_ORDER_API_ERROR]", error);

      return formatResponse(
        false,
        null,
        error?.message ?? "Failed to create order.",
        500,
      );
    }
  },

  {
    requireAuth: false,
    requireRateLimit: true,
  },
);
