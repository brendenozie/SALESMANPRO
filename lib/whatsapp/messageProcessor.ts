/**
 * lib/whatsapp/messageProcessor.ts
 *
 * Re-exports processor for synchronous or standalone invocations.
 */

import { whatsappAI } from "@/lib/whatsapp/ai/whatsappAI";
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
import { decrypt } from "@/lib/crypto";

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
  // Skip if conversation is assigned to a human agent
  if (conversation.mode === "HUMAN" || conversation.humanHandoff) {
    console.info("[WHATSAPP_SKIPPED_HUMAN_MODE]", {
      conversationId: conversation.id,
      correlationId,
    });
    return;
  }

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

  // Execute action if produced
  if (aiResult.action) {
    const actionRes = await actionRouter({
      action: aiResult.action,
      context: actionContext,
    });
    if (actionRes?.message) {
      finalReplyText = actionRes.message;
    }
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
}
