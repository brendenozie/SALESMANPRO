/**
 * lib/whatsapp/actions/orders/createOrder.ts
 *
 * Invokes the unified canonical createOrder service.
 * Never directly mutates database order records outside domain service.
 */

import { createOrder as createUnifiedOrder } from "@/lib/orders/centralizedCreateOrder";
import prisma from "@/server/db/prismadb";
import { whatsappRepository } from "../../repository";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  createOrderActionSchema,
} from "../../types";
import crypto from "node:crypto";
import { z } from "zod";

type CreateOrderArgs = z.infer<typeof createOrderActionSchema>["arguments"];

export async function createOrder(
  args: CreateOrderArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  if (!args.confirmation) {
    return {
      success: false,
      action: "create_order",
      message: "Order confirmation is required before placing the order. Please review the summary and reply YES.",
    };
  }

  // Generate deterministic idempotency key for this conversation message
  const idempotencyKey = `wa_${context.conversationId}_${context.messageId ?? crypto.randomUUID()}`;

  try {
    const result = await createUnifiedOrder({
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
    await prisma.customerOrder.update({
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
    await whatsappRepository.clearCart(context.conversationId);

    const currency = result.pricing.currency ?? "KES";
    const totalFormatted = `${currency} ${result.pricing.total.toLocaleString()}`;

    let nextStepMessage = "";
    if (args.paymentOption === "mpesa") {
      nextStepMessage = `\nWould you like me to send an M-Pesa STK push now to *${args.mpesaPhone ?? context.phoneNumber}*? Reply *PAY* to proceed.`;
    } else if (args.paymentOption === "cod") {
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
  } catch (error) {
    console.error("[WHATSAPP_CREATE_ORDER_ERROR]", error);
    return {
      success: false,
      action: "create_order",
      message: error instanceof Error ? error.message : "Failed to place order. Please try again.",
    };
  }
}
