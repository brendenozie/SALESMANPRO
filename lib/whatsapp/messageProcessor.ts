/**
 * lib/whatsapp/messageProcessor.ts
<<<<<<< HEAD
 */

import {
  whatsappAI,
  type WhatsAppAIContext,
} from "@/lib/whatsapp/ai/whatsappAI";
=======
 *
 * Re-exports processor for synchronous or standalone invocations.
 */

import { whatsappAI } from "@/lib/whatsapp/ai/whatsappAI";
>>>>>>> c00ac535 (Fresh initialization and recovery)
import { actionRouter } from "@/lib/whatsapp/actionRouter";
import { MetaWhatsAppClient } from "@/lib/whatsapp/metaClient";
import { whatsappRepository } from "@/lib/whatsapp/repository";
import type {
  WhatsAppAccount,
  WhatsAppActionContext,
  WhatsAppContact,
  WhatsAppConversation,
  WhatsAppMessage,
} from "@/lib/whatsapp/types";
<<<<<<< HEAD
import prisma from "@/server/db/prismadb";
import { decrypt } from "../crypto";
=======
import { decrypt } from "@/lib/crypto";
>>>>>>> c00ac535 (Fresh initialization and recovery)

export interface ProcessWhatsAppMessageParams {
  account: WhatsAppAccount;
  contact: WhatsAppContact;
  conversation: WhatsAppConversation;
  message: WhatsAppMessage;
  correlationId: string;
}

export async function processWhatsAppMessage({
  account,
  contact,
  conversation,
  message,
  correlationId,
}: ProcessWhatsAppMessageParams): Promise<void> {
<<<<<<< HEAD
  // 1. Skip processing if conversation is assigned to a human agent
  if (conversation.mode === "HUMAN") {
=======
  // Skip if conversation is assigned to a human agent
  if (conversation.mode === "HUMAN" || conversation.humanHandoff) {
>>>>>>> c00ac535 (Fresh initialization and recovery)
    console.info("[WHATSAPP_SKIPPED_HUMAN_MODE]", {
      conversationId: conversation.id,
      correlationId,
    });
    return;
  }

<<<<<<< HEAD
  // 2. Decrypt access token to avoid 401 Unauthorized errors
  const decryptedToken = account.accessTokenEncrypted
    ? decrypt({
        encrypted: account.accessTokenEncrypted,
        iv: account.accessTokenIv,
        tag: account.accessTokenTag,
      })
    : (process.env.WHATSAPP_ACCESS_TOKEN ?? "");

  // 3. Fetch store/company contextual information
  const store = await prisma.company.findUnique({
    where: { id: account.companyId },
    select: {
      id: true,
      name: true,
      description: true,
      website: true,
      phone: true,
      email: true,
      currency: true,
      country: true,
      address: true,
    },
  });

  if (!store) {
    throw new Error(
      `Store context missing for companyId: ${account.companyId}`,
    );
  }

  // 4. Load recent conversation history, customer orders, and active listings
  const [history, recentOrders, relevantProducts] = await Promise.all([
    whatsappRepository.getRecentConversationHistory(conversation.id, 12),
    prisma.customerOrder.findMany({
      where: { companyId: account.companyId, phone: contact.phoneNumber },
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
        companyId: account.companyId,
        status: "ACTIVE",
        isAvailable: true,
      },
      take: 20,
      select: {
        id: true,
        name: true,
        description: true,
        sellingPrice: true,
        finalPrice: true,
        quantity: true,
        isAvailable: true,
      },
    }),
  ]);

  // 5. Build AI processing context
  const aiContext: WhatsAppAIContext = {
    message: message.text ?? "",
    store: {
      companyId: store.id,
      name: store.name,
      description: store.description,
      website: store.website,
      phone: store.phone,
      email: store.email,
      currency: store.currency ?? "KES",
      country: store.country ?? "KE",
      address: store.address,
      aiSettings: {
        enabled: account.isActive,
        requireHumanForRefunds: true,
        requireHumanForComplaints: true,
        maxResponseSentences: 3,
      },
    },
    customer: {
      id: contact.id,
      name: contact.firstName ?? contact.phoneNumber,
      phoneNumber: contact.phoneNumber,
    },
    conversationHistory: history.map((msg) => ({
      role: msg.direction === "INBOUND" ? "user" : "assistant",
      content: msg.body ?? "",
    })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      trackingNumber: o.trackingNumber,
      status: o.status,
      total: o.totalFinalPrice,
    })),
    products: relevantProducts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.finalPrice ?? p.sellingPrice,
      stock: p.quantity,
      available: p.isAvailable,
    })),
  };

  // 6. Execute AI engine processing
  const aiResult = await whatsappAI.processMessage(aiContext);
  let finalReplyText = aiResult.reply;

  // 7. Prepare context for action routing
=======
  // Decrypt access token
  let accessToken = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
  if (account.accessTokenEncrypted && account.accessTokenIv && account.accessTokenTag) {
    accessToken = decrypt({
      value: account.accessTokenEncrypted,
      iv: account.accessTokenIv,
      tag: account.accessTokenTag,
    });
  }

  // Execute AI engine processing
  const aiResult = await whatsappAI.processInboundMessage({
    account,
    contact,
    conversation,
    message,
  });

  let finalReplyText = aiResult.reply;

>>>>>>> c00ac535 (Fresh initialization and recovery)
  const actionContext: WhatsAppActionContext = {
    companyId: account.companyId,
    accountId: account.id,
    conversationId: conversation.id,
    contactId: contact.id,
    waId: contact.waId,
    phoneNumber: contact.phoneNumber,
<<<<<<< HEAD
    customerName: contact.firstName ?? contact.phoneNumber,
=======
    customerName: contact.name ?? contact.profileName,
    customerEmail: contact.email,
    consumerId: contact.userId,
>>>>>>> c00ac535 (Fresh initialization and recovery)
    messageId: message.id,
    correlationId,
  };

<<<<<<< HEAD
  // 8. Handle order status checks
  if (
    aiResult.analysis?.intent === "order_status" &&
    aiResult.analysis?.entities?.orderNumber
  ) {
    const actionRes = await actionRouter({
      action: {
        action: "get_order_status",
        arguments: {
          trackingNumber: aiResult.analysis.entities.orderNumber,
        },
      },
      context: actionContext,
    });
    if (actionRes?.message) {
      finalReplyText = actionRes.message;
    }
  }

  // 9. Escalation trigger
  if (aiResult.requiresHuman) {
    await actionRouter({
      action: {
        action: "escalate_to_human",
        arguments: {
          reason:
            aiResult.analysis?.summary ?? "Customer requested human support",
        },
      },
      context: actionContext,
    });
  }

  // 10. Direct action execution if returned by AI engine
=======
  // Execute action if produced
>>>>>>> c00ac535 (Fresh initialization and recovery)
  if (aiResult.action) {
    const actionRes = await actionRouter({
      action: aiResult.action,
      context: actionContext,
    });
    if (actionRes?.message) {
      finalReplyText = actionRes.message;
    }
<<<<<<< HEAD
  }

  // 11. Send response via Meta WhatsApp Client
  const client = new MetaWhatsAppClient({
    accessToken: decryptedToken,
    phoneNumberId: account.phoneNumberId,
  });

  const sendResponse = await client.sendTextMessage({
    to: contact.phoneNumber,
    body: finalReplyText,
  });

  // 12. Persist response outbound message in database
  await whatsappRepository.persistOutboundMessage({
    companyId: account.companyId,
    accountId: account.id,
    contactId: contact.id,
    conversationId: conversation.id,
    providerMessageId: sendResponse?.messages?.[0]?.id ?? `ai_${Date.now()}`,
    body: finalReplyText,
    status: "SENT",
  });
=======
    if (actionRes?.shouldEscalate) {
      aiResult.requiresHuman = true;
    }
  }

  // Handle human escalation
  if (aiResult.requiresHuman) {
    await whatsappRepository.escalateConversation(
      conversation.id,
      aiResult.intent ?? "Customer requested human support",
    );
  }

  // Send response via Meta Client
  if (accessToken && account.phoneNumberId && contact.phoneNumber) {
    const client = new MetaWhatsAppClient({
      accessToken,
      phoneNumberId: account.phoneNumberId,
    });

    const sendResponse = await client.sendTextMessage({
      to: contact.phoneNumber,
      body: finalReplyText,
    });

    // Persist outbound response
    await whatsappRepository.persistOutboundMessage({
      companyId: account.companyId,
      accountId: account.id,
      contactId: contact.id,
      conversationId: conversation.id,
      providerMessageId: sendResponse?.messages?.[0]?.id ?? `ai_${Date.now()}`,
      body: finalReplyText,
      status: "SENT",
      senderType: "AI",
      aiModel: aiResult.model,
    });
  }
>>>>>>> c00ac535 (Fresh initialization and recovery)
}
