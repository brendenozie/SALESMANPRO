/**
 * lib/ai/agents/domainTools.ts
 *
 * Safe Domain Tools for SalesmanPro AI Agents.
 * AI never executes raw DB queries. All tools run through bounded domain functions.
 */

import prisma from "@/server/db/prismadb";

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: any, context: { companyId: string; userId?: string }) => Promise<unknown>;
}

export const DOMAIN_AGENT_TOOLS: Record<string, AgentToolDefinition> = {
  searchProducts: {
    name: "searchProducts",
    description: "Search for products in the store catalog by keyword or category",
    parameters: {
      query: "string (search query or product name)",
      category: "optional string",
      limit: "optional number (default 5)",
    },
    execute: async (args, context) => {
      const { query = "", category, limit = 5 } = args;
      const products = await prisma.product.findMany({
        where: {
          companyId: context.companyId,
          status: "ACTIVE",
          ...(query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } },
                  { brand: { contains: query, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(category ? { category: { contains: category, mode: "insensitive" } } : {}),
        },
        take: Math.min(limit, 10),
        select: {
          id: true,
          name: true,
          sellingPrice: true,
          finalPrice: true,
          quantity: true,
          isAvailable: true,
          description: true,
          category: true,
        },
      });

      return { products };
    },
  },

  checkOrderStatus: {
    name: "checkOrderStatus",
    description: "Check the status and items of a customer order by order ID or phone number",
    parameters: {
      orderId: "optional string",
      phone: "optional string",
    },
    execute: async (args, context) => {
      const { orderId, phone } = args;
      if (!orderId && !phone) return { error: "orderId or phone is required" };

      const order = await prisma.customerOrder.findFirst({
        where: {
          companyId: context.companyId,
          ...(orderId ? { id: orderId } : {}),
          ...(phone ? { phone: { contains: phone } } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            select: {
              quantity: true,
              price: true,
              totalPrice: true,
              productId: true,
            },
          },
        },
      });

      if (!order) return { found: false, message: "No matching order found" };

      return {
        found: true,
        order: {
          id: order.id,
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalPrice: order.totalFinalPrice || order.totalPrice,
          deliveryStatus: order.deliveryStatus,
          createdAt: order.createdAt,
          itemCount: order.items.length,
        },
      };
    },
  },

  getStoreInfo: {
    name: "getStoreInfo",
    description: "Get general store contact, address, currency, and business hours",
    parameters: {},
    execute: async (_, context) => {
      const company = await prisma.company.findUnique({
        where: { id: context.companyId },
        select: {
          name: true,
          tagline: true,
          description: true,
          currency: true,
          contactEmail: true,
          contactPhone: true,
          address: true,
          openingHours: true,
        },
      });

      return { store: company };
    },
  },
};
