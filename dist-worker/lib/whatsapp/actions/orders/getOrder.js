"use strict";
/**
 * lib/whatsapp/actions/orders/getOrder.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOrderChange = exports.cancelOrder = exports.trackOrder = exports.getOrder = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function getOrder(args, context) {
    const order = await prismadb_1.default.customerOrder.findFirst({
        where: {
            companyId: context.companyId,
            OR: [
                args.orderId ? { id: args.orderId } : undefined,
                args.trackingNumber ? { trackingNumber: args.trackingNumber } : undefined,
            ].filter(Boolean),
        },
        include: {
            items: {
                include: {
                    marketplaceListing: {
                        select: { name: true },
                    },
                },
            },
        },
    });
    if (!order) {
        return {
            success: false,
            action: "get_order",
            message: "I couldn't find an order matching those details in our store.",
        };
    }
    const currency = "KES";
    const itemsText = order.items
        .map((i) => `• ${i.quantity}x ${i.marketplaceListing?.name ?? "Item"} (${currency} ${i.price})`)
        .join("\n");
    const message = [
        `📦 *Order Details #${order.trackingNumber ?? order.id}*`,
        `📅 *Placed on:* ${order.createdAt.toLocaleDateString()}`,
        `📊 *Order Status:* *${order.status}*`,
        `💳 *Payment Status:* *${order.paymentStatus}* (${order.paymentOption ?? "N/A"})`,
        `🚚 *Delivery:* ${order.deliveryStatus ?? "Processing"}`,
        ``,
        `*Items:*`,
        itemsText,
        ``,
        `💰 *Total:* *${currency} ${(order.totalFinalPrice ?? order.totalPrice ?? 0).toLocaleString()}*`,
    ].join("\n");
    return {
        success: true,
        action: "get_order",
        message,
        data: { order },
    };
}
exports.getOrder = getOrder;
async function trackOrder(args, context) {
    return getOrder(args, context);
}
exports.trackOrder = trackOrder;
async function cancelOrder(args, context) {
    const order = await prismadb_1.default.customerOrder.findFirst({
        where: {
            id: args.orderId,
            companyId: context.companyId,
        },
    });
    if (!order) {
        return {
            success: false,
            action: "cancel_order",
            message: "I couldn't find that order to cancel.",
        };
    }
    if (order.status === "DELIVERED" || order.status === "SHIPPED") {
        return {
            success: false,
            action: "cancel_order",
            message: `Order #${order.trackingNumber ?? order.id} has already been ${order.status.toLowerCase()} and cannot be cancelled automatically. Let me connect you with our support team.`,
            shouldEscalate: true,
        };
    }
    await prismadb_1.default.customerOrder.update({
        where: { id: order.id },
        data: {
            status: "CANCELLED",
            notes: order.notes ? `${order.notes}\n[WhatsApp Cancellation]: ${args.reason}` : `[WhatsApp Cancellation]: ${args.reason}`,
        },
    });
    return {
        success: true,
        action: "cancel_order",
        message: `✅ Order #${order.trackingNumber ?? order.id} has been cancelled successfully.`,
        data: { orderId: order.id, cancelled: true },
    };
}
exports.cancelOrder = cancelOrder;
async function requestOrderChange(args, context) {
    const order = await prismadb_1.default.customerOrder.findFirst({
        where: {
            id: args.orderId,
            companyId: context.companyId,
        },
    });
    if (!order) {
        return {
            success: false,
            action: "request_order_change",
            message: "I couldn't find that order to modify.",
        };
    }
    await prismadb_1.default.customerOrder.update({
        where: { id: order.id },
        data: {
            requiresHumanReview: true,
            notes: order.notes
                ? `${order.notes}\n[Customer Change Request]: ${args.changeDescription}`
                : `[Customer Change Request]: ${args.changeDescription}`,
        },
    });
    return {
        success: true,
        action: "request_order_change",
        message: `I have noted your request to change Order #${order.trackingNumber ?? order.id}: "${args.changeDescription}". A store representative has been notified and will review your request shortly.`,
        data: { requested: true },
    };
}
exports.requestOrderChange = requestOrderChange;
