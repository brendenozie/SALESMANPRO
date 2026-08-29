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
