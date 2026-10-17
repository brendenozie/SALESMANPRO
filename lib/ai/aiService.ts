/**
 * lib/ai/aiService.ts
 *
 * Central AI Platform Service Layer for SalesmanPro.
 * The single source of truth for AI generation, tenant credit accounting,
 * provider routing, idempotency, and audit logging across Web and WhatsApp.
 */

import { modelRegistry } from "./modelRegistry";
import { creditLedger } from "./creditLedger";
import { centralOpenAIProvider } from "./providers/openaiProvider";
import { centralGroqProvider } from "./providers/groqProvider";
import { centralGeminiProvider } from "./providers/geminiProvider";
import { deterministicAIProvider } from "./providers/deterministicProvider";
import { centralImageProvider } from "./providers/imageProvider";
import { centralVideoProvider } from "./providers/videoProvider";
import prisma from "@/server/db/prismadb";
import { superAdminAIService } from "./superAdminService";
import { PromptGuard } from "./promptGuard";
import { ActionRegistry } from "./actionRegistry";
import { IntelligentRouter } from "./routing/intelligentRouter";
import { ProviderPricingCalculator } from "./routing/providerPricing";
import {
  AICapability,
  AIModelMetadata,
  AITextGenerationInput,
  AITextGenerationOutput,
  AIImageGenerationInput,
  AIImageGenerationOutput,
  AIVideoGenerationInput,
  AIVideoGenerationOutput,
  AIExecutionContext,
  AIPlatformError,
} from "./types";

export class CentralAIService {
  /**
   * Unified Text Generation across all models and providers.
   */
  public async generateText(
    input: AITextGenerationInput,
    context: AIExecutionContext,
  ): Promise<AITextGenerationOutput> {
    if (!context.companyId) {
      throw new AIPlatformError("TENANT_NOT_FOUND", "A valid tenant company ID is required", 400);
    }

    // 0. Enforce Super Admin Global Kill-switch
    const isGlobalKilled = await superAdminAIService.getGlobalKillSwitch().catch(() => false);
    if (isGlobalKilled) {
      throw new AIPlatformError(
        "AI_TEMPORARILY_UNAVAILABLE",
        "Platform AI generation is temporarily suspended by system administration.",
        503,
      );
    }

    // 1. Authoritative Super Admin Intelligent Model Routing Resolution
    // Tenant clients CANNOT override modelId. Super Admin routing configuration is the sole authority.
    const routingDecision = await IntelligentRouter.resolveOptimalModel({
      actionId: context.actionId,
      feature: context.feature,
      capability: context.capability,
      agentKey: context.agentKey,
      stage: context.stage,
      prompt: input.prompt,
      requiresJsonSchema: input.jsonSchema,
      overrideMode: context.routingModeOverride,
    });

    const model = await modelRegistry.resolveModel(routingDecision.selectedModelId);

    // 2. Prompt Injection Defense & Data Isolation
    const { sanitized: sanitizedPrompt } = PromptGuard.sanitizeInput(input.prompt);
    const guardedSystemPrompt = PromptGuard.buildGuardedSystemPrompt(
      input.systemPrompt || "You are an intelligent, helpful enterprise commerce assistant for SalesmanPro.",
      { companyName: context.companyId },
    );

    const safeInput: AITextGenerationInput = {
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
    const estimatedCost = modelRegistry.calculateEstimatedCreditCost(model, {
      estimatedPromptTokens: Math.ceil(safeInput.prompt.length / 4) + (safeInput.systemPrompt ? Math.ceil(safeInput.systemPrompt.length / 4) : 0),
      estimatedCompletionTokens: safeInput.maxTokens ?? 1000,
    });

    await creditLedger.reserveCredits({
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
    let output: AITextGenerationOutput | null = null;
    let fallbackOccurred = false;

    const tryExecute = async (targetModel: AIModelMetadata): Promise<AITextGenerationOutput | null> => {
      try {
        let res: AITextGenerationOutput | null = null;
        if (targetModel.provider === "GROQ") {
          const ready = (await centralGroqProvider.isReady?.()) || centralGroqProvider.isConfigured();
          if (ready) res = await centralGroqProvider.generateText(targetModel, safeInput);
        } else if (targetModel.provider === "GEMINI") {
          const ready = (await centralGeminiProvider.isReady?.()) || centralGeminiProvider.isConfigured();
          if (ready) res = await centralGeminiProvider.generateText(targetModel, safeInput);
        } else if (targetModel.provider === "OPENAI") {
          const ready = (await centralOpenAIProvider.isReady?.()) || centralOpenAIProvider.isConfigured();
          if (ready) res = await centralOpenAIProvider.generateText(targetModel, safeInput);
        } else if (targetModel.provider === "CUSTOM" || targetModel.id === "salesmanpro-deterministic-v1") {
          res = await deterministicAIProvider.generateText(targetModel, safeInput);
        }

        if (res) {
          IntelligentRouter.recordProviderSuccess(targetModel.provider);
          return res;
        }
      } catch (err: any) {
        IntelligentRouter.recordProviderFailure(targetModel.provider);
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
          if (fallbackModelId === model.id) continue;
          const fallbackModel = await modelRegistry.resolveModel(fallbackModelId);
          output = await tryExecute(fallbackModel);
          if (output) break;
        }
      }

      // Step C: Guarantee zero-cost deterministic fallback if still unfulfilled
      if (!output) {
        fallbackOccurred = true;
        const deterministicModel = modelRegistry.getModel("salesmanpro-deterministic-v1");
        output = await deterministicAIProvider.generateText(deterministicModel, safeInput);
      }

      // 5. Sanitize output against XSS/scripts
      output.text = PromptGuard.sanitizeOutput(output.text);

      // 6. Calculate real provider fiat cost in USD (separated from tenant credits)
      const providerCostUsd = ProviderPricingCalculator.calculateCostUsd(
        output.model,
        output.promptTokens,
        output.completionTokens,
      );

      // 7. Finalize actual tenant credit charge and persist detailed usage record
      const actualCost = modelRegistry.calculateActualCreditCost(model, {
        promptTokens: output.promptTokens,
        completionTokens: output.completionTokens,
      });

      await creditLedger.finalizeCharge({
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
          estimatedCost: providerCostUsd, // Fiat provider cost in USD
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
    } catch (error: any) {
      // 7. Refund reserved credits on failure
      await creditLedger.refundCredits({
        companyId: context.companyId,
        userId: context.userId,
        amount: estimatedCost,
        description: `Refund for failed AI text generation: ${error.message || "Unknown error"}`,
        idempotencyKey: context.idempotencyKey ? `refund_${context.idempotencyKey}` : undefined,
      });

      if (error instanceof AIPlatformError) throw error;
      throw new AIPlatformError(
        "GENERATION_FAILED",
        error.message || "Failed to generate text content",
        500,
        error,
      );
    }
  }

  /**
   * Unified Image Generation across all models and providers.
   */
  public async generateImage(
    input: AIImageGenerationInput,
    context: AIExecutionContext,
  ): Promise<AIImageGenerationOutput> {
    if (!context.companyId) {
      throw new AIPlatformError("TENANT_NOT_FOUND", "A valid tenant company ID is required", 400);
    }

    const model = modelRegistry.getModel(input.modelId || "dall-e-3");
    if (!model.enabled) {
      throw new AIPlatformError("MODEL_DISABLED", `Model '${model.displayName}' is disabled`, 400);
    }

    const estimatedCost = modelRegistry.calculateEstimatedCreditCost(model, {
      imageCount: input.quantity ?? 1,
      quality: input.quality,
    });

    await creditLedger.reserveCredits({
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
      const output = await centralImageProvider.execute(model, input, {
        companyId: context.companyId,
        userId: context.userId,
      });

      await creditLedger.finalizeCharge({
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
    } catch (error: any) {
      await creditLedger.refundCredits({
        companyId: context.companyId,
        userId: context.userId,
        amount: estimatedCost,
        description: `Refund for failed image generation: ${error.message || "Error"}`,
        idempotencyKey: context.idempotencyKey ? `refund_${context.idempotencyKey}` : undefined,
      });

      if (error instanceof AIPlatformError) throw error;
      throw new AIPlatformError(
        "GENERATION_FAILED",
        error.message || "Failed to generate image",
        500,
        error,
      );
    }
  }

  /**
   * Unified Video Generation (Asynchronous).
   */
  public async generateVideo(
    input: AIVideoGenerationInput,
    context: AIExecutionContext,
  ): Promise<AIVideoGenerationOutput> {
    if (!context.companyId) {
      throw new AIPlatformError("TENANT_NOT_FOUND", "A valid tenant company ID is required", 400);
    }

    const model = modelRegistry.getModel(input.modelId || "salesman-video-v1");
    if (!model.enabled) {
      throw new AIPlatformError("MODEL_DISABLED", `Video model '${model.displayName}' is disabled`, 400);
    }

    const estimatedCost = modelRegistry.calculateEstimatedCreditCost(model, {
      videoDurationSeconds: input.durationSeconds ?? 5,
    });

    await creditLedger.reserveCredits({
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
      const output = await centralVideoProvider.createVideoJob(model, input, {
        companyId: context.companyId,
        userId: context.userId,
        idempotencyKey: context.idempotencyKey,
      });

      return output;
    } catch (error: any) {
      await creditLedger.refundCredits({
        companyId: context.companyId,
        userId: context.userId,
        amount: estimatedCost,
        description: `Refund for failed video job setup: ${error.message || "Error"}`,
      });

      if (error instanceof AIPlatformError) throw error;
      throw new AIPlatformError(
        "GENERATION_FAILED",
        error.message || "Failed to queue video generation job",
        500,
        error,
      );
    }
  }

  /**
   * Polls the status of an asynchronous AI generation job.
   */
  public async getGenerationJob(jobId: string, companyId: string) {
    const job = await prisma.aIGenerationJob.findUnique({
      where: { id: jobId },
      include: {
        company: { select: { id: true, name: true } },
      },
    });

    if (!job || job.companyId !== companyId) {
      throw new AIPlatformError("INVALID_REQUEST", "Generation job not found or unauthorized", 404);
    }

    return job;
  }

  /**
   * Lists generation jobs for a tenant.
   */
  public async listGenerationJobs(params: {
    companyId: string;
    capability?: AICapability;
    page?: number;
    limit?: number;
  }) {
    const { companyId, capability, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (capability) where.capability = capability;

    const [jobs, total] = await Promise.all([
      prisma.aIGenerationJob.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.aIGenerationJob.count({ where }),
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

export const aiService = new CentralAIService();
export const centralAIService = aiService;
