"use strict";
/**
 * lib/ai/providers/groqProvider.ts
 *
 * Server-side Groq Provider Adapter for SalesmanPro Central AI.
 * Ultra-fast structured JSON inference, high-throughput chat & agent reasoning.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.centralGroqProvider = exports.CentralGroqProvider = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const superAdminService_1 = require("../superAdminService");
const types_1 = require("../types");
class CentralGroqProvider {
    name = "GROQ";
    async getClient() {
        const dbKey = await superAdminService_1.superAdminAIService.getDecryptedApiKey("GROQ");
        const apiKey = dbKey || process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new types_1.AIPlatformError("PROVIDER_ERROR", "Groq API key is not configured in Super Admin or server environment", 500);
        }
        return new groq_sdk_1.default({ apiKey });
    }
    isConfigured() {
        return Boolean(process.env.GROQ_API_KEY);
    }
    async generateText(model, input) {
        const startTime = Date.now();
        const groq = await this.getClient();
        const messages = [];
        if (input.systemPrompt) {
            messages.push({
                role: "system",
                content: input.systemPrompt,
            });
        }
        if (input.conversationHistory && input.conversationHistory.length > 0) {
            for (const msg of input.conversationHistory) {
                messages.push({
                    role: msg.role,
                    content: msg.content,
                });
            }
        }
        messages.push({
            role: "user",
            content: input.prompt,
        });
        const targetModel = model.id || process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
        try {
            const response = await groq.chat.completions.create({
                model: targetModel,
                messages,
                temperature: input.temperature ?? 0.3,
                max_tokens: input.maxTokens ?? 2048,
                response_format: input.jsonSchema ? { type: "json_object" } : undefined,
            });
            const choice = response.choices[0];
            const rawText = choice?.message?.content ?? "";
            let json;
            if (input.jsonSchema && rawText) {
                try {
                    json = JSON.parse(rawText);
                }
                catch {
                    // fallback
                }
            }
            const promptTokens = response.usage?.prompt_tokens ?? Math.ceil(input.prompt.length / 4);
            const completionTokens = response.usage?.completion_tokens ?? Math.ceil(rawText.length / 4);
            const totalTokens = response.usage?.total_tokens ?? promptTokens + completionTokens;
            const inputCost = (promptTokens / 1000) * model.inputCreditCost;
            const outputCost = (completionTokens / 1000) * model.outputCreditCost;
            const creditsConsumed = Math.max(model.minimumCredits, Math.ceil(inputCost + outputCost));
            return {
                text: rawText,
                json,
                model: targetModel,
                provider: "GROQ",
                promptTokens,
                completionTokens,
                totalTokens,
                creditsConsumed,
                executionTimeMs: Date.now() - startTime,
            };
        }
        catch (error) {
            console.error("[GROQ_PROVIDER_ERROR]", error);
            throw new types_1.AIPlatformError("GENERATION_FAILED", error.message || "Groq generation failed", 502, error);
        }
    }
}
exports.CentralGroqProvider = CentralGroqProvider;
exports.centralGroqProvider = new CentralGroqProvider();
