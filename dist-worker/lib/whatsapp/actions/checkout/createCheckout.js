"use strict";
/**
 * lib/whatsapp/actions/checkout/createCheckout.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmCheckout = exports.getCheckout = exports.createCheckout = void 0;
const calculateCheckoutTotal_1 = require("../pricing/calculateCheckoutTotal");
const repository_1 = require("../../repository");
async function createCheckout(args, context) {
    // Calculate verified server-side total and save active cart
    return (0, calculateCheckoutTotal_1.calculateCheckoutTotal)(args, context);
}
exports.createCheckout = createCheckout;
async function getCheckout(_args, context) {
    const cart = await repository_1.whatsappRepository.getCart(context.conversationId);
    if (!cart || !cart.pricing) {
        return {
            success: true,
            action: "get_checkout",
            message: "Your shopping cart is currently empty. Tell me what you'd like to order!",
            data: { cart: null },
        };
    }
    const pricing = cart.pricing;
    const currency = pricing.currency ?? "KES";
    return {
        success: true,
        action: "get_checkout",
        message: `🛒 *Current Cart Summary:*\n• Subtotal: ${currency} ${(pricing.subtotal ?? 0).toLocaleString()}\n• Delivery: ${currency} ${(pricing.shipping ?? 0).toLocaleString()}\n• Total: *${currency} ${(pricing.total ?? 0).toLocaleString()}*\n\nReply *YES* to proceed with ordering.`,
        data: { cart },
    };
}
exports.getCheckout = getCheckout;
async function confirmCheckout(_args, context) {
    const cart = await repository_1.whatsappRepository.getCart(context.conversationId);
    if (!cart) {
        return {
            success: false,
            action: "confirm_checkout",
            message: "You don't have an active checkout to confirm. Let's add some items to your cart first!",
        };
    }
    await repository_1.whatsappRepository.updateCart(context.conversationId, {
        ...cart,
        confirmed: true,
        confirmedAt: new Date(),
    });
    return {
        success: true,
        action: "confirm_checkout",
        message: "Thank you for confirming! I am now preparing your order.",
        data: { confirmed: true },
    };
}
exports.confirmCheckout = confirmCheckout;
