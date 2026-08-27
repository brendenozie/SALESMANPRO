"use strict";
/**
 * lib/whatsapp/actions/pricing/calculateCheckoutTotal.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCheckoutTotal = void 0;
const pricing_1 = require("@/lib/pricing");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const repository_1 = require("../../repository");
async function calculateCheckoutTotal(args, context) {
    const listingIds = args.items.map((i) => i.marketplaceListingId);
    const listings = await prismadb_1.default.marketplaceListings.findMany({
        where: {
            id: { in: listingIds },
            companyId: context.companyId,
            status: "ACTIVE",
            isAvailable: true,
        },
        select: { id: true, name: true, sellingPrice: true, finalPrice: true },
    });
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
    // Save session state to active cart
    await repository_1.whatsappRepository.updateCart(context.conversationId, {
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
exports.calculateCheckoutTotal = calculateCheckoutTotal;
