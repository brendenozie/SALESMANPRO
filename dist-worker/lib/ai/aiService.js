"use strict";
/**
 * lib/ai/aiService.ts
 *
 * Central AI Platform Service Layer for SalesmanPro.
 * The single source of truth for AI generation, tenant credit accounting,
 * provider routing, idempotency, and audit logging across Web and WhatsApp.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.centralAIService = exports.aiService = exports.CentralAIService = void 0;
const modelRegistry_1 = require("./modelRegistry");
const creditLedger_1 = require("./creditLedger");
const openaiProvider_1 = require("./providers/openaiProvider");
const groqProvider_1 = require("./providers/groqProvider");
const geminiProvider_1 = require("./providers/geminiProvider");
const deterministicProvider_1 = require("./providers/deterministicProvider");
const imageProvider_1 = require("./providers/imageProvider");
const videoProvider_1 = require("./providers/videoProvider");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const superAdminService_1 = require("./superAdminService");
const promptGuard_1 = require("./promptGuard");
const intelligentRouter_1 = require("./routing/intelligentRouter");
const providerPricing_1 = require("./routing/providerPricing");
const types_1 = require("./types");
class CentralAIService {
    /**
     * Unified Text Generation across all models and providers.
     */
    async generateText(input, context) {
        if (!context.companyId) {
            throw new types_1.AIPlatformError("TENANT_NOT_FOUND", "A valid tenant company ID is required", 400);
        }
        // 0. Enforce Super Admin Global Kill-switch
        const isGlobalKilled = await superAdminService_1.superAdminAIService.getGlobalKillSwitch().catch(() => false);
        if (isGlobalKilled) {
            throw new types_1.AIPlatformError("AI_TEMPORARILY_UNAVAILABLE", "Platform AI generation is temporarily suspended by system administration.", 503);
        }
        // 1. Authoritative Super Admin Intelligent Model Routing Resolution
        // Tenant clients CANNOT override modelId. Super Admin routing configuration is the sole authority.
        const routingDecision = await intelligentRouter_1.IntelligentRouter.resolveOptimalModel({
            actionId: context.actionId,
            feature: context.feature,
            capability: context.capability,
            agentKey: context.agentKey,
            stage: context.stage,
            prompt: input.prompt,
            requiresJsonSchema: input.jsonSchema,
            overrideMode: context.routingModeOverride,
        });
        const model = await modelRegistry_1.modelRegistry.resolveModel(routingDecision.selectedModelId);
        // 2. Prompt Injection Defense & Data Isolation
        const { sanitized: sanitizedPrompt } = promptGuard_1.PromptGuard.sanitizeInput(input.prompt);
        const guardedSystemPrompt = promptGuard_1.PromptGuard.buildGuardedSystemPrompt(input.systemPrompt || "You are an intelligent, helpful enterprise commerce assistant for SalesmanPro.", { companyName: context.companyId });
        const safeInput = {
            ...input,
            prompt: sanitizedPrompt,
            systemPrompt: guardedSystemPrompt,
            context: {
                ...(input.context || {}),
                actionId: context.actionId,
                feature: context.feature,
            },
        };
        // 3. Estimate credit cost & reserve
        const estimatedCost = modelRegistry_1.modelRegistry.calculateEstimatedCreditCost(model, {
            estimatedPromptTokens: Math.ceil(safeInput.prompt.length / 4) + (safeInput.systemPrompt ? Math.ceil(safeInput.systemPrompt.length / 4) : 0),
            estimatedCompletionTokens: safeInput.maxTokens ?? 1000,
        });
        await creditLedger_1.creditLedger.reserveCredits({
            companyId: context.companyId,
            userId: context.userId,
            amount: estimatedCost,
            description: `AI Text Generation (${model.displayName})`,
            idempotencyKey: context.idempotencyKey ? `res_${context.idempotencyKey}` : undefined,
            metadata: {
                actionId: context.actionId,
                modelId: model.id,
                provider: model.provider,
                feature: context.feature,
                source: context.source,
                routingMode: routingDecision.routingMode,
                routingReason: routingDecision.reason,
            },
        });
        // 4. Resilient Provider Execution with Controlled Fallback
        let output = null;
        let fallbackOccurred = false;
        const tryExecute = async (targetModel) => {
            try {
                let res = null;
                if (targetModel.provider === "GROQ") {
                    const ready = (await groqProvider_1.centralGroqProvider.isReady?.()) || groqProvider_1.centralGroqProvider.isConfigured();
                    if (ready)
                        res = await groqProvider_1.centralGroqProvider.generateText(targetModel, safeInput);
                }
                else if (targetModel.provider === "GEMINI") {
                    const ready = (await geminiProvider_1.centralGeminiProvider.isReady?.()) || geminiProvider_1.centralGeminiProvider.isConfigured();
                    if (ready)
                        res = await geminiProvider_1.centralGeminiProvider.generateText(targetModel, safeInput);
                }
                else if (targetModel.provider === "OPENAI") {
                    const ready = (await openaiProvider_1.centralOpenAIProvider.isReady?.()) || openaiProvider_1.centralOpenAIProvider.isConfigured();
                    if (ready)
                        res = await openaiProvider_1.centralOpenAIProvider.generateText(targetModel, safeInput);
                }
                else if (targetModel.provider === "CUSTOM" || targetModel.id === "salesmanpro-deterministic-v1") {
                    res = await deterministicProvider_1.deterministicAIProvider.generateText(targetModel, safeInput);
                }
                if (res) {
                    intelligentRouter_1.IntelligentRouter.recordProviderSuccess(targetModel.provider);
                    return res;
                }
            }
            catch (err) {
                intelligentRouter_1.IntelligentRouter.recordProviderFailure(targetModel.provider);
                console.warn(`[AI_PROVIDER_WARN] Provider ${targetModel.provider} (${targetModel.id}) execution error:`, err?.message || err);
            }
            return null;
        };
        try {
            // Step A: Attempt winning model resolved by router
            output = await tryExecute(model);
            // Step B: Iterate through ordered fallback chain if primary fails
            if (!output && routingDecision.fallbackChain.length > 0) {
                fallbackOccurred = true;
                for (const fallbackModelId of routingDecision.fallbackChain) {
                    if (fallbackModelId === model.id)
                        continue;
                    const fallbackModel = await modelRegistry_1.modelRegistry.resolveModel(fallbackModelId);
                    output = await tryExecute(fallbackModel);
                    if (output)
                        break;
                }
            }
            // Step C: Guarantee zero-cost deterministic fallback if still unfulfilled
            if (!output) {
                fallbackOccurred = true;
                const deterministicModel = modelRegistry_1.modelRegistry.getModel("salesmanpro-deterministic-v1");
                output = await deterministicProvider_1.deterministicAIProvider.generateText(deterministicModel, safeInput);
            }
            // 5. Sanitize output against XSS/scripts
            output.text = promptGuard_1.PromptGuard.sanitizeOutput(output.text);
            // 6. Calculate real provider fiat cost in USD (separated from tenant credits)
            const providerCostUsd = providerPricing_1.ProviderPricingCalculator.calculateCostUsd(output.model, output.promptTokens, output.completionTokens);
            // 7. Finalize actual tenant credit charge and persist detailed usage record
            const actualCost = modelRegistry_1.modelRegistry.calculateActualCreditCost(model, {
                promptTokens: output.promptTokens,
                completionTokens: output.completionTokens,
            });
            await creditLedger_1.creditLedger.finalizeCharge({
                companyId: context.companyId,
                userId: context.userId,
                reservedAmount: estimatedCost,
                actualAmount: actualCost,
                description: `AI Text Generation (${model.displayName})`,
                idempotencyKey: context.idempotencyKey,
                usageData: {
                    capability: context.capability ?? "TEXT",
                    provider: output.provider,
                    model: output.model,
                    promptTokens: output.promptTokens,
                    completionTokens: output.completionTokens,
                    totalTokens: output.totalTokens,
                    source: context.source ?? "WEB",
                    feature: context.feature ?? context.actionId ?? "general_text",
                    executionTimeMs: output.executionTimeMs,
                    estimatedCost: providerCostUsd,
                    metadata: {
                        routingMode: routingDecision.routingMode,
                        routingReason: routingDecision.reason,
                        stage: context.stage,
                        agentKey: context.agentKey,
                        fallbackOccurred,
                        initialSelectedModel: routingDecision.selectedModelId,
                    },
                },
            });
            return {
                ...output,
                creditsConsumed: actualCost,
                providerCostUsd,
                routingDecision,
            };
        }
        catch (error) {
            // 7. Refund reserved credits on failure
            await creditLedger_1.creditLedger.refundCredits({
                companyId: context.companyId,
                userId: context.userId,
                amount: estimatedCost,
                description: `Refund for failed AI text generation: ${error.message || "Unknown error"}`,
                idempotencyKey: context.idempotencyKey ? `refund_${context.idempotencyKey}` : undefined,
            });
            if (error instanceof types_1.AIPlatformError)
                throw error;
            throw new types_1.AIPlatformError("GENERATION_FAILED", error.message || "Failed to generate text content", 500, error);
        }
    }
    /**
     * Unified Image Generation across all models and providers.
     */
    async generateImage(input, context) {
        if (!context.companyId) {
            throw new types_1.AIPlatformError("TENANT_NOT_FOUND", "A valid tenant company ID is required", 400);
        }
        const model = modelRegistry_1.modelRegistry.getModel(input.modelId || "dall-e-3");
        if (!model.enabled) {
            throw new types_1.AIPlatformError("MODEL_DISABLED", `Model '${model.displayName}' is disabled`, 400);
        }
        const estimatedCost = modelRegistry_1.modelRegistry.calculateEstimatedCreditCost(model, {
            imageCount: input.quantity ?? 1,
            quality: input.quality,
        });
        await creditLedger_1.creditLedger.reserveCredits({
            companyId: context.companyId,
            userId: context.userId,
            amount: estimatedCost,
            description: `AI Image Generation (${model.displayName})`,
            idempotencyKey: context.idempotencyKey ? `res_${context.idempotencyKey}` : undefined,
            metadata: {
                prompt: input.prompt,
                action: input.action,
                productId: input.productId,
            },
        });
        try {
            const output = await imageProvider_1.centralImageProvider.execute(model, input, {
                companyId: context.companyId,
                userId: context.userId,
            });
            await creditLedger_1.creditLedger.finalizeCharge({
                companyId: context.companyId,
                userId: context.userId,
                reservedAmount: estimatedCost,
                actualAmount: output.creditsConsumed,
                description: `AI Image Generation (${model.displayName})`,
                idempotencyKey: context.idempotencyKey,
                usageData: {
                    capability: "IMAGE",
                    provider: output.provider,
                    model: output.model,
                    inputUnits: output.images.length,
                    outputUnits: output.images.length,
                    source: context.source ?? "WEB",
                    feature: input.action || "generate_image",
                    executionTimeMs: output.executionTimeMs,
                },
            });
            return output;
        }
        catch (error) {
            await creditLedger_1.creditLedger.refundCredits({
                companyId: context.companyId,
                userId: context.userId,
                amount: estimatedCost,
                description: `Refund for failed image generation: ${error.message || "Error"}`,
                idempotencyKey: context.idempotencyKey ? `refund_${context.idempotencyKey}` : undefined,
            });
            if (error instanceof types_1.AIPlatformError)
                throw error;
            throw new types_1.AIPlatformError("GENERATION_FAILED", error.message || "Failed to generate image", 500, error);
        }
    }
    /**
     * Unified Video Generation (Asynchronous).
     */
    async generateVideo(input, context) {
        if (!context.companyId) {
            throw new types_1.AIPlatformError("TENANT_NOT_FOUND", "A valid tenant company ID is required", 400);
        }
        const model = modelRegistry_1.modelRegistry.getModel(input.modelId || "salesman-video-v1");
        if (!model.enabled) {
            throw new types_1.AIPlatformError("MODEL_DISABLED", `Video model '${model.displayName}' is disabled`, 400);
        }
        const estimatedCost = modelRegistry_1.modelRegistry.calculateEstimatedCreditCost(model, {
            videoDurationSeconds: input.durationSeconds ?? 5,
        });
        await creditLedger_1.creditLedger.reserveCredits({
            companyId: context.companyId,
            userId: context.userId,
            amount: estimatedCost,
            description: `AI Video Generation Job (${model.displayName})`,
            idempotencyKey: context.idempotencyKey ? `res_${context.idempotencyKey}` : undefined,
            metadata: {
                prompt: input.prompt,
                productId: input.productId,
            },
        });
        try {
            const output = await videoProvider_1.centralVideoProvider.createVideoJob(model, input, {
                companyId: context.companyId,
                userId: context.userId,
                idempotencyKey: context.idempotencyKey,
            });
            return output;
        }
        catch (error) {
            await creditLedger_1.creditLedger.refundCredits({
                companyId: context.companyId,
                userId: context.userId,
                amount: estimatedCost,
                description: `Refund for failed video job setup: ${error.message || "Error"}`,
            });
            if (error instanceof types_1.AIPlatformError)
                throw error;
            throw new types_1.AIPlatformError("GENERATION_FAILED", error.message || "Failed to queue video generation job", 500, error);
        }
    }
    /**
     * Polls the status of an asynchronous AI generation job.
     */
    async getGenerationJob(jobId, companyId) {
        const job = await prismadb_1.default.aIGenerationJob.findUnique({
            where: { id: jobId },
            include: {
                company: { select: { id: true, name: true } },
            },
        });
        if (!job || job.companyId !== companyId) {
            throw new types_1.AIPlatformError("INVALID_REQUEST", "Generation job not found or unauthorized", 404);
        }
        return job;
    }
    /**
     * Lists generation jobs for a tenant.
     */
    async listGenerationJobs(params) {
        const { companyId, capability, page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;
        const where = { companyId };
        if (capability)
            where.capability = capability;
        const [jobs, total] = await Promise.all([
            prismadb_1.default.aIGenerationJob.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prismadb_1.default.aIGenerationJob.count({ where }),
        ]);
        return {
            jobs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
exports.CentralAIService = CentralAIService;
exports.aiService = new CentralAIService();
exports.centralAIService = exports.aiService;
