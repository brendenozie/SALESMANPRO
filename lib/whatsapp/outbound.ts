import prisma from "@/server/db/prismadb";
import { MetaWhatsAppClient } from "@/lib/whatsapp/metaClient";
import { whatsappRepository } from "@/lib/whatsapp/repository";
import { decryptWhatsAppAccessToken } from "@/lib/whatsapp/credentials";

export async function sendAdminWhatsAppReply(params: {
  companyId: string;
  conversationId: string;
  text: string;
  pauseAi?: boolean;
}) {
  const conversation = await prisma.whatsAppConversation.findFirst({
    where: { id: params.conversationId, companyId: params.companyId },
    include: {
      WhatsAppContact: true,
      WhatsAppAccount: true,
    },
  });

  if (!conversation || !conversation.WhatsAppContact || !conversation.WhatsAppAccount) {
    throw new Error("Conversation not found");
  }

  const accessToken = decryptWhatsAppAccessToken(conversation.WhatsAppAccount);
  if (!accessToken || !conversation.WhatsAppAccount.phoneNumberId) {
    throw new Error("WhatsApp account is not connected");
  }

  const client = new MetaWhatsAppClient({
    accessToken,
    phoneNumberId: conversation.WhatsAppAccount.phoneNumberId,
  });

  const sendResponse = await client.sendTextMessage({
    to: conversation.WhatsAppContact.phoneNumber,
    body: params.text,
  });

  const outbound = await whatsappRepository.persistOutboundMessage({
    companyId: params.companyId,
    accountId: conversation.WhatsAppAccount.id,
    contactId: conversation.WhatsAppContact.id,
    conversationId: conversation.id,
    providerMessageId: sendResponse?.messages?.[0]?.id,
    body: params.text,
    status: "SENT",
    senderType: "AGENT",
    isAI: false,
  });

  if (params.pauseAi !== false) {
    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: {
        mode: "HUMAN",
        humanHandoff: true,
        aiPaused: true,
        status: "WAITING_FOR_AGENT",
      },
    });
  }

  return outbound;
}

/**
 * Dispatches an approved outbound outreach proposal to a prospective merchant
 * via Meta WhatsApp Cloud API (pre-approved HSM template with text fallback).
 */
export async function sendOutboundProspectWhatsApp(params: {
  to: string;
  businessName: string;
  contactName?: string;
  angle?: string;
  companyId?: string;
}) {
  const { normalizePhoneNumber } = await import("@/lib/whatsapp/normalizePhone");
  const normalizedPhone = normalizePhoneNumber(params.to);
  if (!normalizedPhone) {
    throw new Error(`Invalid recipient phone number for WhatsApp outreach: ${params.to}`);
  }

  // Find active WhatsApp account
  const account = await prisma.whatsAppAccount.findFirst({
    where: {
      isActive: true,
      ...(params.companyId ? { companyId: params.companyId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  if (!account || !account.phoneNumberId) {
    throw new Error("No active WhatsApp Business Account found with valid credentials");
  }

  const accessToken = decryptWhatsAppAccessToken(account);
  if (!accessToken) {
    throw new Error("Unable to decrypt WhatsApp access token for outbound messaging");
  }

  const client = new MetaWhatsAppClient({
    accessToken,
    phoneNumberId: account.phoneNumberId,
  });

  const contactGreeting = params.contactName || params.businessName;
  const benefitPitch = params.angle || "automated WhatsApp checkout and instant mobile storefront";

  try {
    // 1. Try sending pre-approved HSM template
    const templateRes = await client.sendTemplateMessage({
      to: normalizedPhone,
      templateName: "salesmanpro_merchant_outreach",
      languageCode: "en_US",
      bodyParameters: [contactGreeting, benefitPitch],
    });
    console.log(`[WHATSAPP_OUTBOUND_HSM_SUCCESS] Sent HSM outreach template to ${normalizedPhone}`);
    return {
      success: true,
      channel: "WHATSAPP_HSM",
      messageId: templateRes?.messages?.[0]?.id,
    };
  } catch (templateError: any) {
    console.warn(
      "[WHATSAPP_HSM_FALLBACK] HSM template unavailable or pending approval, falling back to direct message:",
      templateError?.message,
    );

    // 2. Direct message fallback
    const directRes = await client.sendTextMessage({
      to: normalizedPhone,
      body: `Hello *${contactGreeting}*! 👋\n\nWe noticed *${params.businessName}* and wanted to show you how SalesmanPro provides an instant mobile storefront, automated WhatsApp ordering with AI, and M-Pesa integrated checkout tailored for *${benefitPitch}*.\n\nWould you be open to a quick 2-minute demo this week? Reply *YES* to learn more! 🙏`,
    });

    return {
      success: true,
      channel: "WHATSAPP_DIRECT",
      messageId: directRes?.messages?.[0]?.id,
    };
  }
}

