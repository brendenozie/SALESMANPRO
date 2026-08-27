// app/api/pricing/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";

import { calculateOrderPricing, PricingError } from "@/lib/pricing";

const optionSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  extraPrice: z.number().nonnegative().optional(),
});

const itemSchema = z.object({
  marketplaceListingId: z.string().min(1),

  quantity: z.number().int().positive(),

  date: z.string().nullable().optional(),

  timeSlot: z.string().nullable().optional(),

  selectedOptions: z.array(optionSchema).optional(),

  serviceNotes: z.string().nullable().optional(),

  durationHours: z.number().positive().nullable().optional(),
});

const pricingSchema = z.object({
  companyId: z.string().min(1),

  items: z.array(itemSchema).min(1),

  promoCode: z.string().nullable().optional(),

  shippingMethod: z.string().nullable().optional(),

  shippingAddress: z.record(z.string(), z.unknown()).nullable().optional(),

  mode: z
    .enum([
      "PRODUCT",
      "SERVICE",
      "RENTAL",
      "BOOKING",
      "PROPERTY",
      "VEHICLE",
      "DIGITAL",
    ])
    .optional(),
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = pricingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pricing request.",
          details: parsed.error.flatten(),
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    const pricing = await calculateOrderPricing(parsed.data);

    return NextResponse.json(
      {
        success: true,
        data: pricing,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("[PRICING_API_ERROR]", error);

    if (error instanceof PricingError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        {
          status: error.status,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to calculate pricing.",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}
