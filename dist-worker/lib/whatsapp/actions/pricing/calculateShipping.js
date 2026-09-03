"use strict";
/**
 * lib/whatsapp/actions/pricing/calculateShipping.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDiscount = exports.calculateShipping = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function calculateShipping(args, context) {
    const shippingSettings = await prismadb_1.default.shippingSettings.findFirst({
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
exports.calculateShipping = calculateShipping;
async function validateDiscount(args, context) {
    const promotion = await prismadb_1.default.promotionDiscount.findFirst({
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
exports.validateDiscount = validateDiscount;
