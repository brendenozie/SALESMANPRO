"use strict";
/**
 * lib/ai/providers/geminiProvider.ts
 *
 * Server-side Google Gemini Provider Adapter for SalesmanPro Central AI.
 * Handles Gemini 2.0 Flash / 1.5 Pro multimodal and text reasoning.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.centralGeminiProvider = exports.CentralGeminiProvider = void 0;
const superAdminService_1 = require("../superAdminService");
const types_1 = require("../types");
class CentralGeminiProvider {
    name = "GEMINI";
    async getApiKey() {
        const dbKey = await superAdminService_1.superAdminAIService.getDecryptedApiKey("GEMINI");
        const key = dbKey || process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
        if (!key) {
            throw new types_1.AIPlatformError("PROVIDER_ERROR", "Google Gemini API key is not configured in Super Admin or server environment", 500);
        }
        return key;
    }
    isConfigured() {
        return Boolean(process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY);
    }
    async generateText(model, input) {
        const startTime = Date.now();
        const apiKey = await this.getApiKey();
        const targetModel = model.id || "gemini-2.0-flash";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
        const contents = [];
        if (input.conversationHistory && input.conversationHistory.length > 0) {
            for (const msg of input.conversationHistory) {
                contents.push({
                    role: msg.role === "assistant" ? "model" : "user",
                    parts: [{ text: msg.content }],
                });
            }
        }
        contents.push({
            role: "user",
            parts: [{ text: input.prompt }],
        });
        const systemInstruction = input.systemPrompt
            ? {
                parts: [{ text: input.systemPrompt }],
            }
            : undefined;
        const generationConfig = {
            temperature: input.temperature ?? 0.7,
            maxOutputTokens: input.maxTokens ?? 2048,
        };
        if (input.jsonSchema) {
            generationConfig.responseMimeType = "application/json";
        }
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents,
                    systemInstruction,
                    generationConfig,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Gemini API error status: ${response.status}`);
            }
            const data = await response.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            let json;
            if (input.jsonSchema && rawText) {
                try {
                    json = JSON.parse(rawText);
                }
                catch {
                    // fallback
                }
            }
            const usage = data.usageMetadata;
            const promptTokens = usage?.promptTokenCount ?? Math.ceil(input.prompt.length / 4);
            const completionTokens = usage?.candidatesTokenCount ?? Math.ceil(rawText.length / 4);
            const totalTokens = usage?.totalTokenCount ?? promptTokens + completionTokens;
            const inputCost = (promptTokens / 1000) * model.inputCreditCost;
            const outputCost = (completionTokens / 1000) * model.outputCreditCost;
            const creditsConsumed = Math.max(model.minimumCredits, Math.ceil(inputCost + outputCost));
            return {
                text: rawText,
                json,
                model: targetModel,
                provider: "GEMINI",
                promptTokens,
                completionTokens,
                totalTokens,
                creditsConsumed,
                executionTimeMs: Date.now() - startTime,
            };
        }
        catch (error) {
            console.error("[GEMINI_PROVIDER_ERROR]", error);
            throw new types_1.AIPlatformError("GENERATION_FAILED", error.message || "Gemini generation failed", 502, error);
        }
    }
}
exports.CentralGeminiProvider = CentralGeminiProvider;
exports.centralGeminiProvider = new CentralGeminiProvider();
