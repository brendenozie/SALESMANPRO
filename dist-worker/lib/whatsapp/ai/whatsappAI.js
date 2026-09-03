"use strict";
/**
 * lib/whatsapp/ai/whatsappAI.ts
 *
 * WhatsApp AI orchestrator — uses the Central AI Platform for inference
 * and the shared credit ledger (reserve → infer → finalize / refund).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappAI = exports.WhatsAppAIService = void 0;
const aiService_1 = require("@/lib/ai/aiService");
const types_1 = require("@/lib/ai/types");
const prompts_1 = require("./prompts");
const context_1 = require("./context");
const repository_1 = require("../repository");
const types_2 = require("../types");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
function parseStructuredReply(raw, json) {
    const source = json ?? (() => {
        try {
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    })();
    if (!source) {
        return {
            reply: raw || "How can I help you today?",
            action: null,
            intent: "unknown",
            sentiment: "neutral",
            confidence: 0.5,
            requiresHuman: false,
        };
    }
    let action = null;
    if (source.action && typeof source.action === "object") {
        const validated = types_2.whatsappActionSchema.safeParse(source.action);
        if (validated.success) {
            action = validated.data;
        }
    }
    return {
        reply: typeof source.reply === "string"
            ? source.reply
            : "How can I help you with our store today?",
        action,
        intent: typeof source.intent === "string" ? source.intent : "unknown",
        sentiment: typeof source.sentiment === "string" ? source.sentiment : "neutral",
        confidence: typeof source.confidence === "number" ? source.confidence : 0.9,
        requiresHuman: Boolean(source.requiresHuman || source.escalate),
    };
}
class WhatsAppAIService {
    async processInboundMessage(params) {
        const { account, contact, conversation, message } = params;
        const aiConfig = await prismadb_1.default.whatsAppAIConfig.findUnique({
            where: { companyId: account.companyId },
        });
        const currentText = message.text?.trim() ||
            (message.type === "IMAGE"
                ? "[Customer sent an image]"
                : message.type === "AUDIO"
                    ? "[Customer sent a voice note]"
                    : message.type === "DOCUMENT"
                        ? "[Customer sent a document]"
                        : message.type === "VIDEO"
                            ? "[Customer sent a video]"
                            : message.type === "LOCATION"
                                ? "[Customer shared a location]"
                                : "");
        if (!currentText) {
            return {
                reply: "I received your message. How can I help you with our store today?",
                action: null,
                intent: "empty",
                sentiment: "neutral",
                confidence: 1,
                model: "offline",
                provider: "SYSTEM",
            };
        }
        const context = await (0, context_1.assembleAIContext)({
            account,
            contact,
            conversation,
        });
        const systemPrompt = (0, prompts_1.buildSystemPrompt)({
            store: context.storeContext,
            customer: context.customerContext,
            catalogPreview: context.catalogPreview,
        });
        // In the new architecture, model resolution is centrally governed by Super Admin
        // capability routing for "WHATSAPP", ensuring tenant stores don't dictate raw models.
        const modelId = undefined;
        try {
            const output = await aiService_1.aiService.generateText({
                prompt: currentText,
                systemPrompt,
                modelId,
                temperature: aiConfig?.temperature ?? 0.3,
                maxTokens: aiConfig?.maxTokens ?? 1000,
                jsonSchema: true,
                conversationHistory: context.conversationHistory,
            }, {
                companyId: account.companyId,
                source: "WHATSAPP",
                feature: "whatsapp_concierge",
                capability: "WHATSAPP",
                idempotencyKey: `whatsapp:${message.id}`,
            });
            const structured = parseStructuredReply(output.text, output.json);
            await repository_1.whatsappRepository.recordAIUsage({
                companyId: account.companyId,
                conversationId: conversation.id,
                provider: output.provider === "OPENAI"
                    ? "OPENAI"
                    : output.provider === "GEMINI"
                        ? "GOOGLE"
                        : "CUSTOM",
                model: output.model,
                inputTokens: output.promptTokens,
                outputTokens: output.completionTokens,
                aiCreditsUsed: output.creditsConsumed,
            }).catch(() => undefined);
            await repository_1.whatsappRepository.updateConversationState(conversation.id, {
                aiIntent: structured.intent,
                aiSummary: structured.reply.slice(0, 100),
                aiConfidence: structured.confidence,
            });
            return {
                reply: structured.reply,
                action: structured.action,
                intent: structured.intent,
                sentiment: structured.sentiment,
                confidence: structured.confidence,
                inputTokens: output.promptTokens,
                outputTokens: output.completionTokens,
                model: output.model,
                provider: output.provider === "OPENAI"
                    ? "OPENAI"
                    : output.provider === "GEMINI"
                        ? "GOOGLE"
                        : "CUSTOM",
                requiresHuman: structured.requiresHuman,
            };
        }
        catch (error) {
            console.error("[WHATSAPP_AI_INFERENCE_ERROR]", error);
            if (error instanceof types_1.AIPlatformError && error.code === "INSUFFICIENT_CREDITS") {
                return {
                    reply: "Hello! Our automated AI assistant is currently resting. A human sales representative will be with you shortly to assist!",
                    action: null,
                    intent: "credit_exhausted",
                    sentiment: "neutral",
                    confidence: 1,
                    model: "offline",
                    provider: "SYSTEM",
                    requiresHuman: true,
                };
            }
            await prismadb_1.default.aIUsage.create({
                data: {
                    companyId: account.companyId,
                    capability: "WHATSAPP",
                    provider: "SYSTEM",
                    model: modelId,
                    source: "WHATSAPP",
                    feature: "whatsapp_concierge",
                    status: "FAILED",
                    errorMessage: error instanceof Error ? error.message : "AI inference failed",
                },
            }).catch(() => undefined);
            return {
                reply: "I'm currently having trouble completing that request. Would you like me to connect you with our support team?",
                action: null,
                intent: "unknown",
                sentiment: "neutral",
                confidence: 0.5,
                model: modelId,
                provider: "SYSTEM",
            };
        }
    }
}
exports.WhatsAppAIService = WhatsAppAIService;
exports.whatsappAI = new WhatsAppAIService();
