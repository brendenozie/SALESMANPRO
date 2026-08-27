"use strict";
/**
 * lib/whatsapp/actions/pricing/calculatePrice.ts
 *
 * Invokes the canonical server-side pricing engine for authoritative price calculation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePrice = void 0;
const pricing_1 = require("@/lib/pricing");
async function calculatePrice(args, context) {
    try {
        const pricing = await (0, pricing_1.calculateOrderPricing)({
            companyId: context.companyId,
            items: args.items.map((item) => ({
                marketplaceListingId: item.marketplaceListingId,
                quantity: item.quantity,
                selectedOptions: item.selectedOptions ?? [],
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
    }
    catch (error) {
        return {
            success: false,
            action: "calculate_price",
            message: error instanceof Error ? error.message : "Unable to calculate price for these items.",
        };
    }
}
exports.calculatePrice = calculatePrice;
