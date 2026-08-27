/**
 * lib/whatsapp/actions/customer/getCustomerOrders.ts
 */

import prisma from "@/server/db/prismadb";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  getCustomerOrdersActionSchema,
} from "../../types";
import { z } from "zod";

type GetCustomerOrdersArgs = z.infer<typeof getCustomerOrdersActionSchema>["arguments"];

export async function getCustomerOrders(
  args: GetCustomerOrdersArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const orders = await prisma.customerOrder.findMany({
    where: {
      companyId: context.companyId,
      phone: context.phoneNumber,
    },
    orderBy: { createdAt: "desc" },
    take: args.limit ?? 3,
    select: {
      id: true,
      trackingNumber: true,
      status: true,
      paymentStatus: true,
      paymentOption: true,
      deliveryStatus: true,
      totalFinalPrice: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
          price: true,
          marketplaceListing: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!orders.length) {
    return {
      success: true,
      action: "get_customer_orders",
      message: "You have no previous orders with us yet. Would you like to explore our products?",
      data: { orders: [] },
    };
  }

  const orderSummaries = orders.map((o) => {
    const items = o.items.map((i) => `${i.quantity}x ${i.marketplaceListing?.name ?? "Item"}`).join(", ");
    return `📦 *Order #${o.trackingNumber ?? o.id}*\n   • Items: ${items}\n   • Total: KES ${(o.totalFinalPrice ?? 0).toLocaleString()}\n   • Status: *${o.status}* | Payment: *${o.paymentStatus}*\n   • Delivery: ${o.deliveryStatus ?? "Processing"}`;
  }).join("\n\n");

  return {
    success: true,
    action: "get_customer_orders",
    message: `Here are your recent orders:\n\n${orderSummaries}\n\nLet me know if you would like more details on any specific order!`,
    data: { orders },
  };
}
