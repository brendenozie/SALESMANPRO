"use strict";
/**
 * lib/whatsapp/ai/groqProvider.ts
 *
 * Groq AI Provider implementation supporting fast JSON-mode structured inference.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqAIProvider = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const types_1 = require("../types");
class GroqAIProvider {
    name = "CUSTOM";
    defaultModel;
    client;
    constructor(options) {
        const apiKey = options.apiKey ?? process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROQ_API_KEY is not configured.");
        }
        this.client = new groq_sdk_1.default({ apiKey });
        this.defaultModel =
            options.model ??
                process.env.GROQ_MODEL ??
                "llama-3.3-70b-versatile";
    }
    async processConversation(params) {
        const model = this.defaultModel;
        const messages = [
            { role: "system", content: params.systemPrompt },
            ...params.conversationHistory.slice(-10).map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
            { role: "user", content: params.currentMessage },
        ];
        const response = await this.client.chat.completions.create({
            model,
            messages,
            temperature: params.temperature ?? 0.3,
            max_tokens: params.maxTokens ?? 1000,
            response_format: { type: "json_object" },
        });
        const rawContent = response.choices?.[0]?.message?.content ?? "{}";
        let parsed;
        try {
            parsed = JSON.parse(rawContent);
        }
        catch {
            parsed = {
                reply: "I'm here to help you explore products, check orders, and assist with store inquiries. How can I help you?",
                action: null,
            };
        }
        let action = null;
        if (parsed.action && typeof parsed.action === "object") {
            const validatedAction = types_1.whatsappActionSchema.safeParse(parsed.action);
            if (validatedAction.success) {
                action = validatedAction.data;
            }
        }
        return {
            reply: parsed.reply ??
                "Hello! How can I assist you with your shopping or order today?",
            action,
            intent: parsed.intent ?? "unknown",
            sentiment: parsed.sentiment ?? "neutral",
            confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.9,
            inputTokens: response.usage?.prompt_tokens ?? 0,
            outputTokens: response.usage?.completion_tokens ?? 0,
            model,
            provider: this.name,
            requiresHuman: parsed.requiresHuman ?? parsed.escalate ?? false,
        };
    }
    async classifyIntent(message) {
        try {
            const response = await this.client.chat.completions.create({
                model: this.defaultModel,
                messages: [
                    {
                        role: "system",
                        content: 'Classify customer message intent. Return JSON: { "intent": string, "confidence": number, "entities": object }',
                    },
                    { role: "user", content: message },
                ],
                temperature: 0.1,
                max_tokens: 150,
                response_format: { type: "json_object" },
            });
            const parsed = JSON.parse(response.choices?.[0]?.message?.content ?? "{}");
            return {
                intent: parsed.intent ?? "general",
                confidence: parsed.confidence ?? 0.8,
                entities: parsed.entities ?? {},
            };
        }
        catch {
            return { intent: "unknown", confidence: 0.5 };
        }
    }
}
exports.GroqAIProvider = GroqAIProvider;
