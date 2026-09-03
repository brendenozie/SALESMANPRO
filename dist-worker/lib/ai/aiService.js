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
const imageProvider_1 = require("./providers/imageProvider");
const videoProvider_1 = require("./providers/videoProvider");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const superAdminService_1 = require("./superAdminService");
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
        // 1. Resolve model via Super Admin capability routing if modelId not explicitly provided
        let targetModelId = input.modelId;
        if (!targetModelId && context.capability) {
            const routingConfig = await prismadb_1.default.platformAIServiceConfig.findFirst({
                where: { capability: context.capability, enabled: true },
            });
            if (routingConfig?.primaryModelId) {
                targetModelId = routingConfig.primaryModelId;
            }
        }
        const model = modelRegistry_1.modelRegistry.getModel(targetModelId);
        if (!model.enabled) {
            throw new types_1.AIPlatformError("MODEL_DISABLED", `Selected AI model '${model.displayName}' is currently disabled`, 400);
        }
        // 2. Estimate credit cost & reserve
        const estimatedCost = modelRegistry_1.modelRegistry.calculateEstimatedCreditCost(model, {
            estimatedPromptTokens: Math.ceil(input.prompt.length / 4) + (input.systemPrompt ? Math.ceil(input.systemPrompt.length / 4) : 0),
            estimatedCompletionTokens: input.maxTokens ?? 1000,
        });
        const reservation = await creditLedger_1.creditLedger.reserveCredits({
            companyId: context.companyId,
            userId: context.userId,
            amount: estimatedCost,
            description: `AI Text Generation (${model.displayName})`,
            idempotencyKey: context.idempotencyKey ? `res_${context.idempotencyKey}` : undefined,
            metadata: {
                modelId: model.id,
                provider: model.provider,
                feature: context.feature,
                source: context.source,
            },
        });
        // 3. Route to provider adapter
        let output;
        try {
            if (model.provider === "GROQ" && groqProvider_1.centralGroqProvider.isConfigured()) {
                output = await groqProvider_1.centralGroqProvider.generateText(model, input);
            }
            else if (model.provider === "GEMINI" && geminiProvider_1.centralGeminiProvider.isConfigured()) {
                output = await geminiProvider_1.centralGeminiProvider.generateText(model, input);
            }
            else if (openaiProvider_1.centralOpenAIProvider.isConfigured()) {
                output = await openaiProvider_1.centralOpenAIProvider.generateText(model, input);
            }
            else if (groqProvider_1.centralGroqProvider.isConfigured()) {
                // Fallback to Groq if OpenAI is not available
                output = await groqProvider_1.centralGroqProvider.generateText(model, input);
            }
            else {
                throw new types_1.AIPlatformError("AI_TEMPORARILY_UNAVAILABLE", "No AI provider credentials are configured on the server. Please check server environment secrets.", 503);
            }
            // 4. Finalize actual charge and record usage
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
                    feature: context.feature ?? "general_text",
                    executionTimeMs: output.executionTimeMs,
                },
            });
            return {
                ...output,
                creditsConsumed: actualCost,
            };
        }
        catch (error) {
            // 5. Refund reserved credits on failure
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
