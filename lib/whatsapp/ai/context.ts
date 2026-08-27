/**
 * lib/whatsapp/ai/context.ts
 *
 * Context builder for WhatsApp AI conversations.
 * Gathers store profile, customer identity, active cart, recent orders, and catalog preview.
 */

import prisma from "@/server/db/prismadb";
import { whatsappRepository } from "../repository";
import type {
  WhatsAppAccount,
  WhatsAppContact,
  WhatsAppConversation,
} from "../types";

export interface AssembledAIContext {
  storeContext: {
    companyId: string;
    name: string;
    description?: string | null;
    currency: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    website?: string | null;
    policies?: {
      shipping?: string | null;
      returns?: string | null;
      payment?: string | null;
    };
    supportedPaymentMethods: string[];
    systemInstructions?: string | null;
  };
  customerContext: {
    name?: string | null;
    phoneNumber: string;
    totalOrders: number;
    activeCart?: Record<string, unknown> | null;
    recentOrders: Array<{
      id: string;
      trackingNumber?: string | null;
      status: string;
      total?: number | null;
    }>;
  };
  conversationHistory: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  catalogPreview: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;
}

export async function assembleAIContext(params: {
  account: WhatsAppAccount;
  contact: WhatsAppContact;
  conversation: WhatsAppConversation;
  historyLimit?: number;
}): Promise<AssembledAIContext> {
  const { account, contact, conversation, historyLimit = 12 } = params;
  const companyId = account.companyId;

  // 1. Fetch store profile, payment settings, and AI config in parallel
  const [company, paymentSettings, aiConfig, recentMessages, recentOrders, featuredListings] =
    await Promise.all([
      prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          name: true,
          description: true,
          currency: true,
          contactPhone: true,
          contactEmail: true,
          address: true,
          domain: true,
        },
      }),
      prisma.paymentSettings.findFirst({
        where: { company: { id: companyId } },
      }),
      prisma.whatsAppAIConfig.findUnique({
        where: { companyId },
      }),
      whatsappRepository.getRecentConversationHistory(conversation.id, historyLimit),
      prisma.customerOrder.findMany({
        where: {
          companyId,
          phone: contact.phoneNumber,
        },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          trackingNumber: true,
          status: true,
          totalFinalPrice: true,
        },
      }),
      prisma.marketplaceListings.findMany({
        where: {
          companyId,
          status: "ACTIVE",
          isAvailable: true,
        },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          name: true,
          sellingPrice: true,
          finalPrice: true,
          quantity: true,
        },
      }),
    ]);

  if (!company) {
    throw new Error(`Company not found for companyId: ${companyId}`);
  }

  // Determine supported payment methods
  const supportedPaymentMethods: string[] = [];
  if (paymentSettings?.isMpesaEnabled) supportedPaymentMethods.push("M-Pesa");
  if (paymentSettings?.isPaystackEnabled) supportedPaymentMethods.push("Paystack / Card");
  if (paymentSettings?.isStripeEnabled) supportedPaymentMethods.push("Stripe / Card");
  if (paymentSettings?.isGhubaEnabled) supportedPaymentMethods.push("Ghuba");
  supportedPaymentMethods.push("Cash on Delivery (COD)");

  // Retrieve active cart from conversation state
  const activeCart = (conversation.cart as Record<string, unknown>) ?? null;

  return {
    storeContext: {
      companyId: company.id,
      name: company.name,
      description: company.description,
      currency: company.currency ?? "KES",
      phone: company.contactPhone,
      email: company.contactEmail,
      address: company.address,
      website: company.domain ? `https://${company.domain}` : undefined,
      policies: {
        shipping: "Standard delivery takes 1-2 business days across major locations.",
        returns: "Returns accepted within 7 days in original condition.",
        payment: `We accept ${supportedPaymentMethods.join(", ")}.`,
      },
      supportedPaymentMethods,
      systemInstructions: aiConfig?.systemPrompt,
    },
    customerContext: {
      name: contact.name ?? contact.profileName ?? "Customer",
      phoneNumber: contact.phoneNumber,
      totalOrders: recentOrders.length,
      activeCart,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        trackingNumber: o.trackingNumber,
        status: o.status,
        total: o.totalFinalPrice,
      })),
    },
    conversationHistory: recentMessages.map((msg) => ({
      role: msg.direction === "INBOUND" ? "user" : "assistant",
      content: msg.body ?? "",
    })),
    catalogPreview: featuredListings.map((l) => ({
      id: l.id,
      name: l.name,
      price: l.finalPrice ?? l.sellingPrice,
      stock: l.quantity,
    })),
  };
}
