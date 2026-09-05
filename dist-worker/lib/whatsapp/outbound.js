"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOutboundProspectWhatsApp = exports.sendAdminWhatsAppReply = void 0;
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
/**
 * Dispatches an approved outbound outreach proposal to a prospective merchant
 * via Meta WhatsApp Cloud API (pre-approved HSM template with text fallback).
 */
async function sendOutboundProspectWhatsApp(params) {
    const { normalizePhoneNumber } = await Promise.resolve().then(() => __importStar(require("@/lib/whatsapp/normalizePhone")));
    const normalizedPhone = normalizePhoneNumber(params.to);
    if (!normalizedPhone) {
        throw new Error(`Invalid recipient phone number for WhatsApp outreach: ${params.to}`);
    }
    // Find active WhatsApp account
    const account = await prismadb_1.default.whatsAppAccount.findFirst({
        where: {
            isActive: true,
            ...(params.companyId ? { companyId: params.companyId } : {}),
        },
        orderBy: { createdAt: "desc" },
    });
    if (!account || !account.phoneNumberId) {
        throw new Error("No active WhatsApp Business Account found with valid credentials");
    }
    const accessToken = (0, credentials_1.decryptWhatsAppAccessToken)(account);
    if (!accessToken) {
        throw new Error("Unable to decrypt WhatsApp access token for outbound messaging");
    }
    const client = new metaClient_1.MetaWhatsAppClient({
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
    }
    catch (templateError) {
        console.warn("[WHATSAPP_HSM_FALLBACK] HSM template unavailable or pending approval, falling back to direct message:", templateError?.message);
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
exports.sendOutboundProspectWhatsApp = sendOutboundProspectWhatsApp;
