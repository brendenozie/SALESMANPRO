"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminWhatsAppReply = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const metaClient_1 = require("@/lib/whatsapp/metaClient");
const repository_1 = require("@/lib/whatsapp/repository");
const credentials_1 = require("@/lib/whatsapp/credentials");
async function sendAdminWhatsAppReply(params) {
    const conversation = await prismadb_1.default.whatsAppConversation.findFirst({
        where: { id: params.conversationId, companyId: params.companyId },
        include: {
            WhatsAppContact: true,
            WhatsAppAccount: true,
        },
    });
    if (!conversation || !conversation.WhatsAppContact || !conversation.WhatsAppAccount) {
        throw new Error("Conversation not found");
    }
    const accessToken = (0, credentials_1.decryptWhatsAppAccessToken)(conversation.WhatsAppAccount);
    if (!accessToken || !conversation.WhatsAppAccount.phoneNumberId) {
        throw new Error("WhatsApp account is not connected");
    }
    const client = new metaClient_1.MetaWhatsAppClient({
        accessToken,
        phoneNumberId: conversation.WhatsAppAccount.phoneNumberId,
    });
    const sendResponse = await client.sendTextMessage({
        to: conversation.WhatsAppContact.phoneNumber,
        body: params.text,
    });
    const outbound = await repository_1.whatsappRepository.persistOutboundMessage({
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
        await prismadb_1.default.whatsAppConversation.update({
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
exports.sendAdminWhatsAppReply = sendAdminWhatsAppReply;
