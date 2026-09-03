"use strict";
/**
 * lib/whatsapp/actions/support/escalateToHuman.ts
 *
 * Transfers conversation to a human support agent and pauses automatic AI responses.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupportRequest = exports.escalateToHuman = void 0;
const repository_1 = require("../../repository");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function escalateToHuman(args, context) {
    // Update conversation mode to HUMAN
    await repository_1.whatsappRepository.escalateConversation(context.conversationId, args.reason);
    // Create an in-app notification for the company staff
    await prismadb_1.default.notification.create({
        data: {
            companyId: context.companyId,
            title: "WhatsApp Human Assistance Requested",
            message: `Customer ${context.customerName ?? context.phoneNumber} requested human support: "${args.reason}".`,
            read: false,
        },
    }).catch(() => undefined);
    return {
        success: true,
        action: "escalate_to_human",
        message: "I've connected you with a member of our team. A representative will assist you shortly. Thank you for your patience! 🙏",
        shouldEscalate: true,
        shouldRespond: true,
        data: {
            escalated: true,
            reason: args.reason,
            conversationId: context.conversationId,
        },
    };
}
exports.escalateToHuman = escalateToHuman;
async function createSupportRequest(args, context) {
    // Create an inquiry or notification for store support
    await prismadb_1.default.inquiry.create({
        data: {
            clientName: context.customerName ?? context.phoneNumber,
            clientPhone: context.phoneNumber,
            clientEmail: context.customerEmail ?? `wa-${context.waId}@support.local`,
            message: `[${args.priority ?? "MEDIUM"}] ${args.subject}: ${args.description}`,
            companyId: context.companyId,
        },
    }).catch(() => undefined);
    return {
        success: true,
        action: "create_support_request",
        message: `Your support request ("${args.subject}") has been logged with reference to your phone number. Our team will review it and reply soon.`,
        data: { created: true },
    };
}
exports.createSupportRequest = createSupportRequest;
