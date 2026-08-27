/**
 * lib/whatsapp/actions/pricing/calculateShipping.ts
 */

import prisma from "@/server/db/prismadb";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  calculateShippingActionSchema,
} from "../../types";
import { z } from "zod";

type CalculateShippingArgs = z.infer<typeof calculateShippingActionSchema>["arguments"];

export async function calculateShipping(
  args: CalculateShippingArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const shippingSettings = await prisma.shippingSettings.findFirst({
    where: { company: { id: context.companyId } },
  });

  const isExpress = args.shippingMethod?.toLowerCase().includes("express");
  const fee = isExpress
    ? (shippingSettings?.expressRate ?? 350)
    : (shippingSettings?.standardRate ?? 200);

  return {
    success: true,
    action: "calculate_shipping",
    message: `🚚 Delivery fee for your location is *KES ${fee.toLocaleString()}* (${isExpress ? "Express" : "Standard"} delivery).`,
    data: {
      deliveryFee: fee,
      shippingMethod: isExpress ? "Express" : "Standard",
      address: args.shippingAddress,
    },
  };
}

export async function validateDiscount(
  args: { promoCode: string; subtotal?: number },
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const promotion = await prisma.promotion.findFirst({
    where: {
      companyId: context.companyId,
      code: args.promoCode.trim().toUpperCase(),
      isActive: true,
      endDate: { gte: new Date() },
    },
  });

  if (!promotion) {
    return {
      success: false,
      action: "validate_discount",
      message: `Coupon code "${args.promoCode}" is invalid or expired.`,
    };
  }

  const discountAmount = promotion.discountPercentage
    ? ((args.subtotal ?? 1000) * promotion.discountPercentage) / 100
    : (promotion.discountAmount ?? 0);

  return {
    success: true,
    action: "validate_discount",
    message: `🎉 Promo code *${promotion.code}* applied! You get ${promotion.discountPercentage ? `${promotion.discountPercentage}% off` : `KES ${promotion.discountAmount} off`}.`,
    data: {
      promoCode: promotion.code,
      discountAmount,
      discountPercentage: promotion.discountPercentage,
    },
  };
}
