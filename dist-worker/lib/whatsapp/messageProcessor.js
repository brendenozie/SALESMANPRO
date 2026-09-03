"use strict";
/**
 * Shared inbound WhatsApp job processor used by the BullMQ worker.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWhatsAppMessage = exports.processWhatsAppMessageJob = void 0;
const whatsappAI_1 = require("@/lib/whatsapp/ai/whatsappAI");
const actionRouter_1 = require("@/lib/whatsapp/actionRouter");
const metaClient_1 = require("@/lib/whatsapp/metaClient");
const repository_1 = require("@/lib/whatsapp/repository");
const credentials_1 = require("@/lib/whatsapp/credentials");
const normalizePhone_1 = require("@/lib/whatsapp/normalizePhone");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function processWhatsAppMessageJob(params) {
    const { accountId, companyId, contactId, conversationId, messageId, correlationId, } = params;
    const [account, contact, conversation, message, aiConfig] = await Promise.all([
        prismadb_1.default.whatsAppAccount.findUnique({ where: { id: accountId } }),
        prismadb_1.default.whatsAppContact.findUnique({ where: { id: contactId } }),
        prismadb_1.default.whatsAppConversation.findUnique({ where: { id: conversationId } }),
        prismadb_1.default.whatsAppMessage.findUnique({ where: { id: messageId } }),
        prismadb_1.default.whatsAppAIConfig.findUnique({ where: { companyId } }),
    ]);
    if (!account || !contact || !conversation || !message) {
        throw new Error(`Missing job dependency data: account=${Boolean(account)}, contact=${Boolean(contact)}, conversation=${Boolean(conversation)}, message=${Boolean(message)}`);
    }
    if (account.companyId !== companyId || conversation.companyId !== companyId) {
        throw new Error("Tenant mismatch on WhatsApp job payload");
    }
    if (message.direction !== "INBOUND" || message.senderType !== "CUSTOMER") {
        console.info("[WHATSAPP_SKIPPED_NON_CUSTOMER]", { messageId, correlationId });
        return;
    }
    const businessPhone = (0, normalizePhone_1.normalizePhoneNumber)(account.phoneNumber);
    const customerPhone = (0, normalizePhone_1.normalizePhoneNumber)(contact.phoneNumber);
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
    const claimed = await prismadb_1.default.whatsAppMessage.updateMany({
        where: { id: message.id, processedByAI: false, direction: "INBOUND" },
        data: { processedByAI: true },
    });
    if (claimed.count === 0) {
        return;
    }
    try {
        const accessToken = (0, credentials_1.decryptWhatsAppAccessToken)(account);
        const client = accessToken && account.phoneNumberId
            ? new metaClient_1.MetaWhatsAppClient({
                accessToken,
                phoneNumberId: account.phoneNumberId,
            })
            : null;
        if (client && message.whatsappMessageId) {
            await client.markMessageAsRead(message.whatsappMessageId).catch(() => false);
        }
        const aiResult = await whatsappAI_1.whatsappAI.processInboundMessage({
            account,
            contact,
            conversation,
            message,
        });
        let finalReplyText = aiResult.reply;
        const actionContext = {
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
            const actionResult = await (0, actionRouter_1.actionRouter)({
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
            await repository_1.whatsappRepository.escalateConversation(conversation.id, aiResult.intent ?? "Customer assistance requested");
        }
        if (client && contact.phoneNumber && finalReplyText) {
            const sendResponse = await client.sendTextMessage({
                to: contact.phoneNumber,
                body: finalReplyText,
            });
            await repository_1.whatsappRepository.persistOutboundMessage({
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
        await prismadb_1.default.whatsAppMessage.update({
            where: { id: message.id },
            data: { processingError: null },
        });
    }
    catch (error) {
        await prismadb_1.default.whatsAppMessage.update({
            where: { id: message.id },
            data: {
                processedByAI: false,
                processingError: error instanceof Error ? error.message : "Processing failed",
            },
        });
        throw error;
    }
}
exports.processWhatsAppMessageJob = processWhatsAppMessageJob;
/** @deprecated Use processWhatsAppMessageJob */
exports.processWhatsAppMessage = processWhatsAppMessageJob;
