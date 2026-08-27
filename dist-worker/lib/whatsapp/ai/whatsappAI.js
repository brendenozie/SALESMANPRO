"use strict";
/**
 * lib/whatsapp/ai/whatsappAI.ts
 *
 * Centralized WhatsApp AI Orchestrator.
 * Dynamically resolves provider, builds context and prompt, executes inference,
 * records telemetry/tokens, and returns structured action and response.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappAI = exports.WhatsAppAIService = void 0;
const groqProvider_1 = require("./groqProvider");
const openaiProvider_1 = require("./openaiProvider");
const prompts_1 = require("./prompts");
const context_1 = require("./context");
const repository_1 = require("../repository");
const creditLedger_1 = require("@/lib/ai/creditLedger");
const modelRegistry_1 = require("@/lib/ai/modelRegistry");
class WhatsAppAIService {
    getProvider(companyId) {
        // Check if GROQ_API_KEY is available (fastest default)
        if (process.env.GROQ_API_KEY) {
            return new groqProvider_1.GroqAIProvider({});
        }
        // Fall back to OpenAI
        if (process.env.OPENAI_API_KEY) {
            return new openaiProvider_1.OpenAIProvider({});
        }
        throw new Error("No AI provider configured. Set GROQ_API_KEY or OPENAI_API_KEY.");
    }
    /**
     * Main entry point to process an inbound WhatsApp message.
     */
    async processInboundMessage(params) {
        const { account, contact, conversation, message } = params;
        // Check central credit balance first
        const hasCredits = await creditLedger_1.creditLedger.hasSufficientCredits(account.companyId, 1);
        if (!hasCredits) {
            console.warn(`[WHATSAPP_AI_INSUFFICIENT_CREDITS] Company ${account.companyId} has no AI credits remaining`);
            return {
                reply: "Hello! Our automated AI assistant is currently resting. A human sales representative will be with you shortly to assist!",
                action: null,
                intent: "credit_exhausted",
                sentiment: "neutral",
                confidence: 1.0,
                model: "offline",
                provider: "SYSTEM",
            };
        }
        const provider = this.getProvider(account.companyId);
        // 1. Assemble rich domain context
        const context = await (0, context_1.assembleAIContext)({
            account,
            contact,
            conversation,
        });
        // 2. Build multi-tenant system prompt
        const systemPrompt = (0, prompts_1.buildSystemPrompt)({
            store: context.storeContext,
            customer: context.customerContext,
            catalogPreview: context.catalogPreview,
        });
        const currentText = message.text ?? "";
        // 3. Execute AI provider inference with automatic fallback
        let result;
        try {
            result = await provider.processConversation({
                systemPrompt,
                conversationHistory: context.conversationHistory,
                currentMessage: currentText,
            });
        }
        catch (error) {
            console.error("[WHATSAPP_AI_INFERENCE_ERROR]", error);
            // Graceful conversational fallback
            result = {
                reply: "I'm currently having trouble connecting to my product database. How else can I assist you, or would you like me to connect you to our support team?",
                action: null,
                intent: "unknown",
                sentiment: "neutral",
                confidence: 0.5,
                model: provider.defaultModel,
                provider: provider.name,
            };
        }
        // 4. Record token telemetry & deduct from Central Credit Ledger
        const inputTokens = result.inputTokens ?? Math.ceil(currentText.length / 4);
        const outputTokens = result.outputTokens ?? Math.ceil(result.reply.length / 4);
        const modelMeta = modelRegistry_1.modelRegistry.getModel(result.model);
        const creditsCost = modelRegistry_1.modelRegistry.calculateActualCreditCost(modelMeta, {
            promptTokens: inputTokens,
            completionTokens: outputTokens,
        });
        repository_1.whatsappRepository
            .recordAIUsage({
            companyId: account.companyId,
            conversationId: conversation.id,
            provider: result.provider,
            model: result.model,
            inputTokens,
            outputTokens,
            aiCreditsUsed: creditsCost,
        })
            .catch((err) => console.error("[WHATSAPP_RECORD_AI_USAGE_ERROR]", err));
        // 5. Update conversation state with intent, summary, and confidence
        await repository_1.whatsappRepository.updateConversationState(conversation.id, {
            aiIntent: result.intent,
            aiSummary: result.reply.slice(0, 100),
            aiConfidence: result.confidence,
        });
        return result;
    }
}
exports.WhatsAppAIService = WhatsAppAIService;
exports.whatsappAI = new WhatsAppAIService();
