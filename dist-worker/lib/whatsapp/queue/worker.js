"use strict";
/**
 * lib/whatsapp/queue/worker.ts
 *
 * BullMQ Worker processing inbound WhatsApp events asynchronously.
 * Executes AI reasoning, structured actions, and sends Meta WhatsApp replies.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWhatsAppWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const queue_1 = require("./queue");
const whatsappAI_1 = require("../ai/whatsappAI");
const actionRouter_1 = require("../actionRouter");
const metaClient_1 = require("../metaClient");
const repository_1 = require("../repository");
const crypto_1 = require("@/lib/crypto");
function createWhatsAppWorker() {
    const worker = new bullmq_1.Worker(queue_1.WHATSAPP_QUEUE_NAME, async (job) => {
        const { accountId, companyId, contactId, conversationId, messageId, correlationId, } = job.data;
        console.log("[WHATSAPP_WORKER_JOB_START]", {
            jobId: job.id,
            conversationId,
            messageId,
            correlationId,
        });
        // 1. Fetch full context records
        const [account, contact, conversation, message] = await Promise.all([
            prismadb_1.default.whatsAppAccount.findUnique({ where: { id: accountId } }),
            prismadb_1.default.whatsAppContact.findUnique({ where: { id: contactId } }),
            prismadb_1.default.whatsAppConversation.findUnique({ where: { id: conversationId } }),
            prismadb_1.default.whatsAppMessage.findUnique({ where: { id: messageId } }),
        ]);
        if (!account || !contact || !conversation || !message) {
            throw new Error(`Missing job dependency data: account=${Boolean(account)}, contact=${Boolean(contact)}, conversation=${Boolean(conversation)}, message=${Boolean(message)}`);
        }
        // 2. Skip processing if assigned to human agent
        if (conversation.mode === "HUMAN" || conversation.humanHandoff) {
            console.info("[WHATSAPP_WORKER_SKIPPED_HUMAN_MODE]", {
                conversationId,
                correlationId,
            });
            return;
        }
        // 3. Mark message as processed
        await prismadb_1.default.whatsAppMessage.update({
            where: { id: message.id },
            data: { processedByAI: true },
        });
        // 4. Decrypt account access token
        let accessToken = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
        if (account.accessTokenEncrypted && account.accessTokenIv && account.accessTokenTag) {
            accessToken = (0, crypto_1.decrypt)({
                value: account.accessTokenEncrypted,
                iv: account.accessTokenIv,
                tag: account.accessTokenTag,
            });
        }
        // 5. Run AI Engine inference
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
        // 6. Execute structured domain action if generated
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
        // 7. Handle human escalation flag
        if (aiResult.requiresHuman) {
            await repository_1.whatsappRepository.escalateConversation(conversation.id, aiResult.intent ?? "Customer assistance requested");
        }
        // 8. Dispatch reply to customer via Meta Client
        if (accessToken && account.phoneNumberId && contact.phoneNumber) {
            const client = new metaClient_1.MetaWhatsAppClient({
                accessToken,
                phoneNumberId: account.phoneNumberId,
            });
            const sendResponse = await client.sendTextMessage({
                to: contact.phoneNumber,
                body: finalReplyText,
            });
            // 9. Persist outbound message in database
            await repository_1.whatsappRepository.persistOutboundMessage({
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
        console.log("[WHATSAPP_WORKER_JOB_COMPLETED]", {
            jobId: job.id,
            conversationId,
            correlationId,
        });
    }, {
        connection: redis_1.redisConnection,
        concurrency: 5,
        limiter: {
            max: 50,
            duration: 1000,
        },
    });
    worker.on("failed", (job, err) => {
        console.error("[WHATSAPP_WORKER_JOB_FAILED]", {
            jobId: job?.id,
            error: err.message,
        });
    });
    worker.on("error", (err) => {
        console.error("[WHATSAPP_WORKER_ERROR]", err);
    });
    return worker;
}
exports.createWhatsAppWorker = createWhatsAppWorker;
