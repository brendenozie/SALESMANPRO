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
        const envKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
        if (envKey)
            return envKey;
        const dbKey = await superAdminService_1.superAdminAIService.getDecryptedApiKey("GEMINI").catch(() => null);
        const key = dbKey;
        if (!key) {
            throw new types_1.AIPlatformError("PROVIDER_ERROR", "Google Gemini API key is not configured in Super Admin or server environment", 500);
        }
        return key;
    }
    isConfigured() {
        return Boolean(process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY);
    }
    async isReady() {
        if (this.isConfigured())
            return true;
        const dbKey = await superAdminService_1.superAdminAIService.getDecryptedApiKey("GEMINI").catch(() => null);
        return Boolean(dbKey);
    }
    async generateText(model, input) {
        const startTime = Date.now();
        const apiKey = await this.getApiKey();
        let targetModel = model.id || "gemini-3.8-flash";
        if (targetModel.includes("1.5") || targetModel.includes("2.0") || targetModel.includes("2.5")) {
            targetModel = "gemini-3.8-flash";
        }
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
            let response = await fetch(endpoint, {
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
                const errMsg = errorData.error?.message || "";
                if (errMsg.includes("high demand") && targetModel !== "gemini-flash-latest") {
                    console.warn(`[GEMINI] ${targetModel} experiencing high demand, falling back to gemini-flash-latest...`);
                    const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
                    const fallbackRes = await fetch(fallbackEndpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ contents, systemInstruction, generationConfig }),
                    });
                    if (fallbackRes.ok) {
                        response = fallbackRes;
                    }
                    else {
                        throw new Error(errMsg || `Gemini API error status: ${response.status}`);
                    }
                }
                else {
                    throw new Error(errMsg || `Gemini API error status: ${response.status}`);
                }
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
