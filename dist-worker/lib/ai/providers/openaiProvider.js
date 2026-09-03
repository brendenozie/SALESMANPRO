"use strict";
/**
 * lib/ai/providers/openaiProvider.ts
 *
 * Server-side OpenAI Provider Adapter for SalesmanPro Central AI.
 * Handles Chat Completions, Structured JSON, Vision analysis, and DALL-E 3.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.centralOpenAIProvider = exports.CentralOpenAIProvider = void 0;
const openai_1 = __importDefault(require("openai"));
const superAdminService_1 = require("../superAdminService");
const types_1 = require("../types");
class CentralOpenAIProvider {
    name = "OPENAI";
    async getClient() {
        const dbKey = await superAdminService_1.superAdminAIService.getDecryptedApiKey("OPENAI");
        const apiKey = dbKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new types_1.AIPlatformError("PROVIDER_ERROR", "OpenAI API key is not configured in Super Admin or server environment", 500);
        }
        return new openai_1.default({ apiKey });
    }
    isConfigured() {
        return Boolean(process.env.OPENAI_API_KEY);
    }
    async generateText(model, input) {
        const startTime = Date.now();
        const openai = await this.getClient();
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
        const targetModel = model.id || process.env.OPENAI_MODEL || "gpt-4o-mini";
        try {
            const response = await openai.chat.completions.create({
                model: targetModel,
                messages,
                temperature: input.temperature ?? 0.7,
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
                    // fallback if not strictly valid json
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
                provider: "OPENAI",
                promptTokens,
                completionTokens,
                totalTokens,
                creditsConsumed,
                executionTimeMs: Date.now() - startTime,
            };
        }
        catch (error) {
            console.error("[OPENAI_PROVIDER_ERROR]", error);
            throw new types_1.AIPlatformError("GENERATION_FAILED", error.message || "OpenAI generation failed", 502, error);
        }
    }
    async generateImage(model, input) {
        const startTime = Date.now();
        const openai = await this.getClient();
        const targetModel = model.id === "dall-e-2" ? "dall-e-2" : "dall-e-3";
        const quality = input.quality ?? "standard";
        const quantity = targetModel === "dall-e-3" ? 1 : Math.min(input.quantity ?? 1, 4);
        let size = "1024x1024";
        if (input.size) {
            size = input.size;
        }
        else if (input.aspectRatio === "16:9") {
            size = "1792x1024";
        }
        else if (input.aspectRatio === "9:16") {
            size = "1024x1792";
        }
        try {
            const response = await openai.images.generate({
                model: targetModel,
                prompt: input.prompt,
                n: quantity,
                size: targetModel === "dall-e-2" ? "512x512" : size,
                quality: targetModel === "dall-e-3" ? quality : undefined,
                style: targetModel === "dall-e-3" ? input.style ?? "vivid" : undefined,
            });
            const images = (response.data || []).map((img) => ({
                url: img.url || "",
                mimeType: "image/png",
                width: size === "1792x1024" ? 1792 : 1024,
                height: size === "1024x1792" ? 1792 : 1024,
            }));
            let costPerImage = model.imageCreditCost ?? 20;
            if (quality === "hd")
                costPerImage = Math.round(costPerImage * 1.5);
            const creditsConsumed = images.length * costPerImage;
            return {
                images,
                model: targetModel,
                provider: "OPENAI",
                creditsConsumed,
                status: "COMPLETED",
                executionTimeMs: Date.now() - startTime,
            };
        }
        catch (error) {
            console.error("[OPENAI_IMAGE_ERROR]", error);
            throw new types_1.AIPlatformError("GENERATION_FAILED", error.message || "Image generation failed with OpenAI", 502, error);
        }
    }
}
exports.CentralOpenAIProvider = CentralOpenAIProvider;
exports.centralOpenAIProvider = new CentralOpenAIProvider();
