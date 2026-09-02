/**
 * lib/whatsapp/actions/pricing/calculatePrice.ts
 *
 * Invokes the canonical server-side pricing engine for authoritative price calculation.
 */

import { calculateOrderPricing } from "@/lib/pricing";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  calculatePriceActionSchema,
} from "../../types";
import { z } from "zod";

type CalculatePriceArgs = z.infer<typeof calculatePriceActionSchema>["arguments"];

export async function calculatePrice(
  args: CalculatePriceArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  try {
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

    const currency = pricing.currency ?? "KES";
    const subtotalText = `${currency} ${pricing.subtotal.toLocaleString()}`;
    const discountText = pricing.totalDiscount > 0 ? `\n• Discount: -${currency} ${pricing.totalDiscount.toLocaleString()}` : "";
    const shippingText = pricing.shipping > 0 ? `\n• Delivery Fee: ${currency} ${pricing.shipping.toLocaleString()}` : "";
    const totalText = `${currency} ${pricing.total.toLocaleString()}`;

    return {
      success: true,
      action: "calculate_price",
      message: `💰 *Price Calculation:*\n• Subtotal: ${subtotalText}${discountText}${shippingText}\n\n*Total: ${totalText}*`,
      data: { pricing },
    };
  } catch (error) {
    return {
      success: false,
      action: "calculate_price",
      message: error instanceof Error ? error.message : "Unable to calculate price for these items.",
    };
  }
}
