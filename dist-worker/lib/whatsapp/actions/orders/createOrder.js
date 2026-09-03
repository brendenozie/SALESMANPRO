"use strict";
/**
 * lib/whatsapp/actions/orders/createOrder.ts
 *
 * Invokes the unified canonical createOrder service.
 * Never directly mutates database order records outside domain service.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
const centralizedCreateOrder_1 = require("@/lib/orders/centralizedCreateOrder");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const repository_1 = require("../../repository");
const node_crypto_1 = __importDefault(require("node:crypto"));
async function createOrder(args, context) {
    if (!args.confirmation) {
        return {
            success: false,
            action: "create_order",
            message: "Order confirmation is required before placing the order. Please review the summary and reply YES.",
        };
    }
    // Generate deterministic idempotency key for this conversation message
    const idempotencyKey = `wa_${context.conversationId}_${context.messageId ?? node_crypto_1.default.randomUUID()}`;
    try {
        const result = await (0, centralizedCreateOrder_1.createOrder)({
            companyId: context.companyId,
            consumerId: context.consumerId ?? undefined,
            name: args.customerName ?? context.customerName ?? "WhatsApp Customer",
            email: args.customerEmail ?? context.customerEmail ?? `wa-${context.waId}@customer.local`,
            phone: context.phoneNumber,
            mpesaPhone: args.mpesaPhone ?? context.phoneNumber,
            paymentOption: args.paymentOption,
            items: args.items,
            shippingAddress: args.shippingAddress,
            shippingMethod: args.shippingMethod,
            promoCode: args.promoCode,
            notes: args.notes,
            orderSource: "WHATSAPP",
            idempotencyKey,
        });
        // Tag the order with WhatsApp channel metadata
        await prismadb_1.default.customerOrder.update({
            where: { id: result.order.id },
            data: {
                channel: "WHATSAPP",
                channelPhone: context.phoneNumber,
                conversationId: context.conversationId,
                createdByAI: true,
                sourceMessageId: context.messageId,
            },
        });
        // Clear active cart from conversation
        await repository_1.whatsappRepository.clearCart(context.conversationId);
        const currency = result.pricing?.currency ?? "KES";
        const totalFormatted = `${currency} ${result.pricing.total.toLocaleString()}`;
        let nextStepMessage = "";
        if (args.paymentOption === "mpesa") {
            nextStepMessage = `\nWould you like me to send an M-Pesa STK push now to *${args.mpesaPhone ?? context.phoneNumber}*? Reply *PAY* to proceed.`;
        }
        else if (args.paymentOption === "cod") {
            nextStepMessage = `\nPayment will be collected upon delivery in cash or M-Pesa.`;
        }
        const message = `🎉 *Order Placed Successfully!*\n\n📦 *Order #:* \`${result.trackingNumber}\`\n💰 *Total:* *${totalFormatted}*\n🚚 *Status:* Order Received & Processing${nextStepMessage}`;
        return {
            success: true,
            action: "create_order",
            message,
            data: {
                orderId: result.order.id,
                trackingNumber: result.trackingNumber,
                pricing: result.pricing,
                alreadyExists: result.alreadyExists,
            },
        };
    }
    catch (error) {
        console.error("[WHATSAPP_CREATE_ORDER_ERROR]", error);
        return {
            success: false,
            action: "create_order",
            message: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        };
    }
}
exports.createOrder = createOrder;
