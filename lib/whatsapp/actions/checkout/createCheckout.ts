/**
 * lib/whatsapp/actions/checkout/createCheckout.ts
 */

import { calculateCheckoutTotal } from "../pricing/calculateCheckoutTotal";
import { whatsappRepository } from "../../repository";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  createCheckoutActionSchema,
} from "../../types";
import { z } from "zod";

type CreateCheckoutArgs = z.infer<typeof createCheckoutActionSchema>["arguments"];

export async function createCheckout(
  args: CreateCheckoutArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  // Calculate verified server-side total and save active cart
  return calculateCheckoutTotal(args, context);
}

export async function getCheckout(
  _args: Record<string, unknown>,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const cart = await whatsappRepository.getCart(context.conversationId);
  if (!cart || !cart.pricing) {
    return {
      success: true,
      action: "get_checkout",
      message: "Your shopping cart is currently empty. Tell me what you'd like to order!",
      data: { cart: null },
    };
  }

  const pricing = cart.pricing as any;
  const currency = pricing.currency ?? "KES";

  return {
    success: true,
    action: "get_checkout",
    message: `🛒 *Current Cart Summary:*\n• Subtotal: ${currency} ${(pricing.subtotal ?? 0).toLocaleString()}\n• Delivery: ${currency} ${(pricing.shipping ?? 0).toLocaleString()}\n• Total: *${currency} ${(pricing.total ?? 0).toLocaleString()}*\n\nReply *YES* to proceed with ordering.`,
    data: { cart },
  };
}

export async function confirmCheckout(
  _args: Record<string, unknown>,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const cart = await whatsappRepository.getCart(context.conversationId);
  if (!cart) {
    return {
      success: false,
      action: "confirm_checkout",
      message: "You don't have an active checkout to confirm. Let's add some items to your cart first!",
    };
  }

  await whatsappRepository.updateCart(context.conversationId, {
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
