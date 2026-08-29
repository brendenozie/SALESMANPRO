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
import { centralImageProvider } from "./providers/imageProvider";
import { centralVideoProvider } from "./providers/videoProvider";
import prisma from "@/server/db/prismadb";
import {
  AICapability,
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

    // 1. Resolve model & check capabilities
    const model = modelRegistry.getModel(input.modelId);
    if (!model.enabled) {
      throw new AIPlatformError(
        "MODEL_DISABLED",
        `Selected AI model '${model.displayName}' is currently disabled`,
        400,
      );
    }

    // 2. Estimate credit cost & reserve
    const estimatedCost = modelRegistry.calculateEstimatedCreditCost(model, {
      estimatedPromptTokens: Math.ceil(input.prompt.length / 4) + (input.systemPrompt ? Math.ceil(input.systemPrompt.length / 4) : 0),
      estimatedCompletionTokens: input.maxTokens ?? 1000,
    });

    const reservation = await creditLedger.reserveCredits({
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
    let output: AITextGenerationOutput;
    try {
      if (model.provider === "GROQ" && centralGroqProvider.isConfigured()) {
        output = await centralGroqProvider.generateText(model, input);
      } else if (model.provider === "GEMINI" && centralGeminiProvider.isConfigured()) {
        output = await centralGeminiProvider.generateText(model, input);
      } else if (centralOpenAIProvider.isConfigured()) {
        output = await centralOpenAIProvider.generateText(model, input);
      } else if (centralGroqProvider.isConfigured()) {
        // Fallback to Groq if OpenAI is not available
        output = await centralGroqProvider.generateText(model, input);
      } else {
        throw new AIPlatformError(
          "AI_TEMPORARILY_UNAVAILABLE",
          "No AI provider credentials are configured on the server. Please check server environment secrets.",
          503,
        );
      }

      // 4. Finalize actual charge and record usage
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
          feature: context.feature ?? "general_text",
          executionTimeMs: output.executionTimeMs,
        },
      });

      return {
        ...output,
        creditsConsumed: actualCost,
      };
    } catch (error: any) {
      // 5. Refund reserved credits on failure
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
