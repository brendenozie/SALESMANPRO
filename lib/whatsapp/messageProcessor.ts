/**
 * Shared inbound WhatsApp job processor used by the BullMQ worker.
 */

import { whatsappAI } from "@/lib/whatsapp/ai/whatsappAI";
import { actionRouter } from "@/lib/whatsapp/actionRouter";
import { MetaWhatsAppClient } from "@/lib/whatsapp/metaClient";
import { whatsappRepository } from "@/lib/whatsapp/repository";
import { decryptWhatsAppAccessToken } from "@/lib/whatsapp/credentials";
import { normalizePhoneNumber } from "@/lib/whatsapp/normalizePhone";
import prisma from "@/server/db/prismadb";
import type { WhatsAppActionContext } from "@/lib/whatsapp/types";

export interface ProcessWhatsAppMessageParams {
  accountId: string;
  companyId: string;
  contactId: string;
  conversationId: string;
  messageId: string;
  correlationId: string;
}

export async function processWhatsAppMessageJob(
  params: ProcessWhatsAppMessageParams,
): Promise<void> {
  const {
    accountId,
    companyId,
    contactId,
    conversationId,
    messageId,
    correlationId,
  } = params;

  const [account, contact, conversation, message, aiConfig] = await Promise.all([
    prisma.whatsAppAccount.findUnique({ where: { id: accountId } }),
    prisma.whatsAppContact.findUnique({ where: { id: contactId } }),
    prisma.whatsAppConversation.findUnique({ where: { id: conversationId } }),
    prisma.whatsAppMessage.findUnique({ where: { id: messageId } }),
    prisma.whatsAppAIConfig.findUnique({ where: { companyId } }),
  ]);

  if (!account || !contact || !conversation || !message) {
    throw new Error(
      `Missing job dependency data: account=${Boolean(account)}, contact=${Boolean(contact)}, conversation=${Boolean(conversation)}, message=${Boolean(message)}`,
    );
  }

  if (account.companyId !== companyId || conversation.companyId !== companyId) {
    throw new Error("Tenant mismatch on WhatsApp job payload");
  }

  if (message.direction !== "INBOUND" || message.senderType !== "CUSTOMER") {
    console.info("[WHATSAPP_SKIPPED_NON_CUSTOMER]", { messageId, correlationId });
    return;
  }

  const businessPhone = normalizePhoneNumber(account.phoneNumber);
  const customerPhone = normalizePhoneNumber(contact.phoneNumber);
  if (businessPhone && customerPhone && businessPhone === customerPhone) {
    console.info("[WHATSAPP_SKIPPED_ECHO]", { messageId, correlationId });
    return;
  }

  if (message.processedByAI) {
    console.info("[WHATSAPP_SKIPPED_ALREADY_PROCESSED]", { messageId, correlationId });
    return;
  }

  if (conversation.mode === "HUMAN" || conversation.humanHandoff || conversation.aiPaused) {
    console.info("[WHATSAPP_WORKER_SKIPPED_HUMAN_MODE]", { conversationId, correlationId });
    return;
  }

  if (aiConfig && (!aiConfig.enabled || !aiConfig.autoReply)) {
    console.info("[WHATSAPP_WORKER_SKIPPED_AI_DISABLED]", { companyId, correlationId });
    return;
  }

  const claimed = await prisma.whatsAppMessage.updateMany({
    where: { id: message.id, processedByAI: false, direction: "INBOUND" },
    data: { processedByAI: true },
  });

  if (claimed.count === 0) {
    return;
  }

  try {
    const accessToken = decryptWhatsAppAccessToken(account);
    const client =
      accessToken && account.phoneNumberId
        ? new MetaWhatsAppClient({
            accessToken,
            phoneNumberId: account.phoneNumberId,
          })
        : null;

    if (client && message.whatsappMessageId) {
      await client.markMessageAsRead(message.whatsappMessageId).catch(() => false);
    }

    const aiResult = await whatsappAI.processInboundMessage({
      account,
      contact,
      conversation,
      message,
    });

    let finalReplyText = aiResult.reply;

    const actionContext: WhatsAppActionContext = {
      companyId: account.companyId,
      accountId: account.id,
      conversationId: conversation.id,
      contactId: contact.id,
      waId: contact.waId,
      phoneNumber: contact.phoneNumber,
      customerName: contact.name ?? contact.profileName,
      customerEmail: contact.email,
      consumerId: contact.userId,
      messageId: message.id,
      correlationId,
    };

    if (aiResult.action) {
      const actionResult = await actionRouter({
        action: aiResult.action,
        context: actionContext,
      });

      if (actionResult.message) {
        finalReplyText = actionResult.message;
      }

      if (actionResult.shouldEscalate) {
        aiResult.requiresHuman = true;
      }
    }

    if (aiResult.requiresHuman || aiResult.intent === "credit_exhausted") {
      await whatsappRepository.escalateConversation(
        conversation.id,
        aiResult.intent ?? "Customer assistance requested",
      );
    }

    if (client && contact.phoneNumber && finalReplyText) {
      const sendResponse = await client.sendTextMessage({
        to: contact.phoneNumber,
        body: finalReplyText,
      });

      await whatsappRepository.persistOutboundMessage({
        companyId: account.companyId,
        accountId: account.id,
        contactId: contact.id,
        conversationId: conversation.id,
        providerMessageId: sendResponse?.messages?.[0]?.id ?? `ai_${message.id}`,
        body: finalReplyText,
        status: "SENT",
        senderType: "AI",
        isAI: true,
        aiModel: aiResult.model,
      });
    }

    await prisma.whatsAppMessage.update({
      where: { id: message.id },
      data: { processingError: null },
    });
  } catch (error) {
    await prisma.whatsAppMessage.update({
      where: { id: message.id },
      data: {
        processedByAI: false,
        processingError: error instanceof Error ? error.message : "Processing failed",
      },
    });
    throw error;
  }
}

/** @deprecated Use processWhatsAppMessageJob */
export const processWhatsAppMessage = processWhatsAppMessageJob;
