/**
 * lib/whatsapp/actions/pricing/calculateCheckoutTotal.ts
 */

import { calculateOrderPricing } from "@/lib/pricing";
import prisma from "@/server/db/prismadb";
import { whatsappRepository } from "../../repository";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  calculateCheckoutTotalActionSchema,
} from "../../types";
import { z } from "zod";

type CalculateCheckoutTotalArgs = z.infer<typeof calculateCheckoutTotalActionSchema>["arguments"];

export async function calculateCheckoutTotal(
  args: CalculateCheckoutTotalArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const listingIds = args.items.map((i) => i.marketplaceListingId);
  const listings = await prisma.marketplaceListings.findMany({
    where: {
      id: { in: listingIds },
      companyId: context.companyId,
      status: "ACTIVE",
      isAvailable: true,
    },
    select: { id: true, name: true, sellingPrice: true, finalPrice: true },
  });

  const pricing = await calculateOrderPricing({
    companyId: context.companyId,
    items: args.items.map((item) => ({
      marketplaceListingId: item.marketplaceListingId,
      quantity: item.quantity,
      selectedOptions: (item.selectedOptions as any) ?? [],
      date: item.date ?? undefined,
      timeSlot: item.timeSlot ?? undefined,
    })),
    promoCode: args.promoCode ?? undefined,
    shippingMethod: args.shippingMethod ?? undefined,
  });

  // Save session state to active cart
  await whatsappRepository.updateCart(context.conversationId, {
    items: args.items,
    pricing,
    shippingAddress: args.shippingAddress,
    shippingMethod: args.shippingMethod,
    paymentOption: args.paymentOption,
    promoCode: args.promoCode,
  });

  const currency = pricing.currency ?? "KES";
  const itemNames = listings.map((l) => l.name).join(", ");

  const summary = [
    `📋 *Order Summary:*`,
    `🛍️ *Items:* ${itemNames}`,
    `💰 *Subtotal:* ${currency} ${pricing.subtotal.toLocaleString()}`,
    pricing.totalDiscount > 0 ? `🎟️ *Discount:* -${currency} ${pricing.totalDiscount.toLocaleString()}` : "",
    pricing.tax > 0 ? `🏛️ *Tax:* ${currency} ${pricing.tax.toLocaleString()}` : "",
    pricing.shipping > 0 ? `🚚 *Delivery:* ${currency} ${pricing.shipping.toLocaleString()}` : "",
    `\n💵 *Total to Pay:* *${currency} ${pricing.total.toLocaleString()}*`,
    `💳 *Payment Method:* ${args.paymentOption.toUpperCase()}`,
    `\nReply *YES* to place this order, or let me know if you would like to make any changes!`,
  ].filter(Boolean).join("\n");

  return {
    success: true,
    action: "calculate_checkout_total",
    message: summary,
    data: { pricing },
  };
}
