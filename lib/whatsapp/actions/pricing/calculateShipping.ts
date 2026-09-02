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
  const promotion = await prisma.promotionDiscount.findFirst({
    where: {
      companyId: context.companyId,
      code: args.promoCode.trim().toUpperCase(),
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

  const isPercentage = String(promotion.discountType).toUpperCase().includes("PERCENT");
  const discountAmount = isPercentage
    ? ((args.subtotal ?? 1000) * promotion.discountValue) / 100
    : promotion.discountValue;

  return {
    success: true,
    action: "validate_discount",
    message: `🎉 Promo code *${promotion.code}* applied! You get ${isPercentage ? `${promotion.discountValue}% off` : `KES ${promotion.discountValue} off`}.`,
    data: {
      promoCode: promotion.code,
      discountAmount,
      discountPercentage: isPercentage ? promotion.discountValue : undefined,
    },
  };
}
