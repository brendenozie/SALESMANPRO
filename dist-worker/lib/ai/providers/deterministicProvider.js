"use strict";
/**
 * lib/ai/providers/deterministicProvider.ts
 *
 * Zero-Cost, Autonomous Deterministic AI Provider for SalesmanPro.
 * Provides high-fidelity, production-quality structured outputs when paid
 * AI credentials are not yet funded, during rate limits, or when local offline execution is required.
 *
 * Architectural Invariants:
 * 1. ZERO FABRICATED DATA: Does not invent fake prices, store metrics, or invoice line items.
 * 2. HONEST REPORTING: When inputs are insufficient or a task is unsupported, returns structured failure details.
 * 3. CREDIT ACCOUNTING SEPARATION: External provider cost is $0.00, while tenant credit consumption is governed centrally.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deterministicProvider = exports.deterministicAIProvider = exports.DeterministicAIProvider = void 0;
const deterministicTaskRegistry_1 = require("./deterministicTaskRegistry");
class DeterministicAIProvider {
    name = "CUSTOM";
    isConfigured() {
        return true; // Always operational with zero external API dependencies
    }
    async generateText(modelOrInput, possibleInput) {
        const input = possibleInput || modelOrInput;
        const model = possibleInput
            ? modelOrInput
            : {
                id: "salesmanpro-deterministic-v1",
                provider: "CUSTOM",
                capability: "TEXT",
                displayName: "SalesmanPro Autonomous Engine (Zero-Cost)",
                description: "Built-in autonomous deterministic AI provider",
                enabled: true,
                inputCreditCost: 0,
                outputCreditCost: 0,
                minimumCredits: 0,
                maxTokens: 8192,
                contextWindow: 8192,
            };
        const startTime = Date.now();
        const prompt = input.prompt || "";
        const feature = input.context?.feature || "";
        const actionId = input.context?.actionId || "";
        let generatedJson;
        let generatedText = "";
        let isSuccessful = true;
        let executionError;
        // 1. Resolve registered deterministic task handler
        const handler = deterministicTaskRegistry_1.DeterministicTaskRegistry.resolveHandler(actionId, feature, prompt);
        if (handler) {
            const result = await handler.execute(prompt, input.context);
            generatedText = result.text;
            generatedJson = result.json;
            isSuccessful = result.isSuccessful;
            executionError = result.error;
        }
        else {
            // 2. Unsupported task or generic prompt without registered handler
            // HONEST REPORTING: Never return fake "success: true" claims or fabricated success
            isSuccessful = false;
            executionError = "UNSUPPORTED_TASK_OR_REQUIRES_LLM";
            generatedJson = {
                success: false,
                error: "UNSUPPORTED_TASK_OR_REQUIRES_LLM",
                message: "This operation cannot be fulfilled deterministically and requires a generative reasoning language model.",
                actionId: actionId || "GENERAL_TEXT",
                feature: feature || "unspecified",
            };
            generatedText = JSON.stringify(generatedJson, null, 2);
        }
        const promptTokens = Math.max(10, Math.ceil(prompt.length / 4));
        const completionTokens = Math.max(20, Math.ceil(generatedText.length / 4));
        const totalTokens = promptTokens + completionTokens;
        // Zero-credit bug fix: nullish coalescing to 0 instead of coercing 0 to 1 with `|| 1`
        const creditsConsumed = typeof model.minimumCredits === "number" ? model.minimumCredits : 0;
        return {
            text: generatedText,
            json: generatedJson,
            model: "salesmanpro-deterministic-v1",
            provider: "CUSTOM",
            promptTokens,
            completionTokens,
            totalTokens,
            creditsConsumed,
            executionTimeMs: Date.now() - startTime,
            isSuccessful,
            error: executionError,
        };
    }
}
exports.DeterministicAIProvider = DeterministicAIProvider;
exports.deterministicAIProvider = new DeterministicAIProvider();
exports.deterministicProvider = exports.deterministicAIProvider;
