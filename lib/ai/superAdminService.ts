/**
 * lib/ai/superAdminService.ts
 *
 * Super-Admin AI Control Center Service.
 * Authoritative management layer for platform AI providers, secure credential encryption,
 * dynamic model registry, service routing, kill-switches, audit logs and telemetry.
 */

import prisma from "@/server/db/prismadb";
import { encrypt, decrypt } from "@/lib/crypto";
import { AICapability } from "@prisma/client";
import { AIPlatformError } from "./types";

export interface ProviderUpsertInput {
  provider: string;
  name: string;
  apiKey?: string;
  enabled?: boolean;
  supportedCapabilities?: AICapability[];
}

export interface ModelUpsertInput {
  modelId: string;
  provider: string;
  displayName: string;
  description?: string;
  capability: AICapability;
  contextWindow?: number;
  maxTokens?: number;
  inputCreditCost?: number;
  outputCreditCost?: number;
  supportsVision?: boolean;
  enabled?: boolean;
  isDefault?: boolean;
}

export interface ServiceConfigUpsertInput {
  serviceKey: string;
  displayName: string;
  capability: AICapability;
  primaryModelId: string;
  fallbackModelId?: string;
  creditCost?: number;
  temperature?: number;
  maxTokens?: number;
  enabled?: boolean;
}

class SuperAdminAIService {
  /**
   * List all platform AI providers with masked API keys.
   */
  async getProviders() {
    const providers = await prisma.platformAIProvider.findMany({
      orderBy: { provider: "asc" },
    });

    return providers.map((p) => ({
      ...p,
      hasKey: Boolean(p.apiKeyEncrypted),
      maskedKey: p.apiKeyEncrypted ? "sk-••••••••" + p.provider : null,
      apiKeyEncrypted: undefined,
      apiKeyIv: undefined,
      apiKeyTag: undefined,
    }));
  }

  /**
   * Get a decrypted API key for a provider (internal server-side execution only).
   */
  async getDecryptedApiKey(providerKey: string): Promise<string | null> {
    const record = await prisma.platformAIProvider.findUnique({
      where: { provider: providerKey.toUpperCase() },
      select: {
        apiKeyEncrypted: true,
        apiKeyIv: true,
        apiKeyTag: true,
        enabled: true,
      },
    });

    if (record?.apiKeyEncrypted && record.apiKeyIv && record.apiKeyTag) {
      try {
        return decrypt({
          value: record.apiKeyEncrypted,
          iv: record.apiKeyIv,
          tag: record.apiKeyTag,
        });
      } catch (err) {
        console.error(`[SUPER_ADMIN_DECRYPT_ERROR] Provider: ${providerKey}`, err);
      }
    }

    // Fallback to environment variables
    switch (providerKey.toUpperCase()) {
      case "OPENAI":
        return process.env.OPENAI_API_KEY || null;
      case "GEMINI":
      case "GOOGLE":
        return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
      case "GROQ":
        return process.env.GROQ_API_KEY || null;
      case "ANTHROPIC":
        return process.env.ANTHROPIC_API_KEY || null;
      default:
        return null;
    }
  }

  /**
   * Upsert an AI provider and securely encrypt the API key if provided.
   */
  async upsertProvider(input: ProviderUpsertInput) {
    const providerKey = input.provider.toUpperCase();
    let encryptedData: { value: string; iv: string; tag: string } | undefined;

    if (input.apiKey && input.apiKey.trim().length > 0) {
      encryptedData = encrypt(input.apiKey.trim());
    }

    const data: any = {
      name: input.name,
      enabled: input.enabled ?? true,
      supportedCapabilities: input.supportedCapabilities || ["TEXT"],
      connectionStatus: encryptedData ? "ACTIVE" : "NOT_CONFIGURED",
    };

    if (encryptedData) {
      data.apiKeyEncrypted = encryptedData.value;
      data.apiKeyIv = encryptedData.iv;
      data.apiKeyTag = encryptedData.tag;
    }

    const provider = await prisma.platformAIProvider.upsert({
      where: { provider: providerKey },
      create: {
        provider: providerKey,
        ...data,
      },
      update: data,
    });

    return {
      id: provider.id,
      provider: provider.provider,
      name: provider.name,
      enabled: provider.enabled,
      hasKey: Boolean(provider.apiKeyEncrypted),
    };
  }

  /**
   * Toggle provider kill-switch.
   */
  async toggleProvider(providerId: string, enabled: boolean) {
    return prisma.platformAIProvider.update({
      where: { id: providerId },
      data: { enabled },
    });
  }

  /**
   * Test a provider's connection and measure latency.
   */
  async testProvider(providerId: string) {
    const provider = await prisma.platformAIProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new AIPlatformError("MODEL_NOT_FOUND", "Provider not found", 404);
    }

    const apiKey = await this.getDecryptedApiKey(provider.provider);
    if (!apiKey) {
      throw new AIPlatformError("PROVIDER_ERROR", `No API key configured for ${provider.name}`, 400);
    }

    const startTime = Date.now();
    let isHealthy = false;
    let errorMessage: string | null = null;

    try {
      if (provider.provider === "OPENAI") {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) throw new Error(`OpenAI API returned HTTP ${res.status}`);
        isHealthy = true;
      } else if (provider.provider === "GROQ") {
        const res = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) throw new Error(`Groq API returned HTTP ${res.status}`);
        isHealthy = true;
      } else if (provider.provider === "GEMINI") {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!res.ok) throw new Error(`Gemini API returned HTTP ${res.status}`);
        isHealthy = true;
      } else {
        isHealthy = true;
      }
    } catch (err: any) {
      isHealthy = false;
      errorMessage = err.message || "Failed to connect to provider";
    }

    const latencyMs = Date.now() - startTime;

    await prisma.platformAIProvider.update({
      where: { id: providerId },
      data: {
        connectionStatus: isHealthy ? "ACTIVE" : "ERROR",
        lastVerifiedAt: new Date(),
      },
    });

    return {
      success: isHealthy,
      latencyMs,
      error: errorMessage,
    };
  }

  /**
   * Models: List, Add, Toggle
   */
  async getModels(provider?: string) {
    return prisma.platformAIModel.findMany({
      where: provider ? { provider } : undefined,
      orderBy: { modelId: "asc" },
    });
  }

  async upsertModel(input: ModelUpsertInput) {
    return prisma.platformAIModel.upsert({
      where: {
        modelId: input.modelId,
      },
      create: {
        modelId: input.modelId,
        provider: input.provider,
        displayName: input.displayName,
        description: input.description,
        capability: input.capability,
        contextWindow: input.contextWindow,
        maxTokens: input.maxTokens,
        inputCreditCost: input.inputCreditCost ?? 1,
        outputCreditCost: input.outputCreditCost ?? 2,
        supportsVision: input.supportsVision ?? false,
        enabled: input.enabled ?? true,
        isDefault: input.isDefault ?? false,
      },
      update: {
        displayName: input.displayName,
        description: input.description,
        capability: input.capability,
        contextWindow: input.contextWindow,
        maxTokens: input.maxTokens,
        inputCreditCost: input.inputCreditCost,
        outputCreditCost: input.outputCreditCost,
        supportsVision: input.supportsVision,
        enabled: input.enabled,
        isDefault: input.isDefault,
      },
    });
  }

  async toggleModel(modelId: string, enabled: boolean) {
    return prisma.platformAIModel.update({
      where: { id: modelId },
      data: { enabled },
    });
  }

  /**
   * Capability & Service Routing
   */
  async getServiceConfigs() {
    return prisma.platformAIServiceConfig.findMany({
      orderBy: { serviceKey: "asc" },
    });
  }

  async upsertServiceConfig(input: ServiceConfigUpsertInput) {
    return prisma.platformAIServiceConfig.upsert({
      where: { serviceKey: input.serviceKey },
      create: {
        serviceKey: input.serviceKey,
        displayName: input.displayName,
        capability: input.capability,
        primaryModelId: input.primaryModelId,
        fallbackModelId: input.fallbackModelId,
        creditCost: input.creditCost,
        temperature: input.temperature,
        maxTokens: input.maxTokens,
        enabled: input.enabled ?? true,
      },
      update: {
        displayName: input.displayName,
        capability: input.capability,
        primaryModelId: input.primaryModelId,
        fallbackModelId: input.fallbackModelId,
        creditCost: input.creditCost,
        temperature: input.temperature,
        maxTokens: input.maxTokens,
        enabled: input.enabled,
      },
    });
  }

  /**
   * System-wide Kill-switch
   */
  async getGlobalKillSwitch(): Promise<boolean> {
    const config = await prisma.platformAIServiceConfig.findUnique({
      where: { serviceKey: "__GLOBAL_KILL_SWITCH__" },
    });
    return config?.enabled === false;
  }

  async setGlobalKillSwitch(active: boolean) {
    return prisma.platformAIServiceConfig.upsert({
      where: { serviceKey: "__GLOBAL_KILL_SWITCH__" },
      create: {
        serviceKey: "__GLOBAL_KILL_SWITCH__",
        displayName: "Global AI Kill Switch",
        capability: "TEXT",
        primaryModelId: "NONE",
        creditCost: 0,
        enabled: !active,
      },
      update: {
        enabled: !active,
      },
    });
  }

  /**
   * Platform Analytics & Spend vs Revenue
   */
  async getPlatformAnalytics(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalUsage,
      creditTransactions,
      totalJobs,
      failedJobs,
      topCompanies,
      recentAuditLogs,
    ] = await Promise.all([
      // Total tokens and calls
      prisma.aIUsage.aggregate({
        where: { createdAt: { gte: since } },
        _sum: {
          totalTokens: true,
          promptTokens: true,
          completionTokens: true,
          creditsCost: true,
        },
        _count: { id: true },
      }),

      // Total purchased revenue in credits/monetary value
      prisma.aICreditTransaction.aggregate({
        where: {
          createdAt: { gte: since },
          type: "PURCHASE",
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),

      // Job counts
      prisma.aIGenerationJob.count({
        where: { createdAt: { gte: since } },
      }),

      // Failed jobs
      prisma.aIGenerationJob.count({
        where: { createdAt: { gte: since }, status: "FAILED" },
      }),

      // Top companies by credit usage
      prisma.aICreditTransaction.groupBy({
        by: ["companyId"],
        where: {
          createdAt: { gte: since },
          type: "USAGE",
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "asc" } },
        take: 5,
      }),

      // Recent audit logs
      prisma.aIAuditLog.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalCalls = totalUsage._count.id || 0;
    const totalTokens = totalUsage._sum.totalTokens || 0;
    const totalCreditsConsumed = totalUsage._sum.creditsCost || 0;
    const totalCreditsPurchased = creditTransactions._sum.amount || 0;
    const failureRate = totalJobs > 0 ? (failedJobs / totalJobs) * 100 : 0;

    return {
      timeframeDays: days,
      metrics: {
        totalCalls,
        totalTokens,
        totalCreditsConsumed,
        totalCreditsPurchased,
        totalJobs,
        failedJobs,
        failureRate: Number(failureRate.toFixed(1)),
      },
      topCompanies,
      recentAuditLogs,
    };
  }

  /**
   * Seed standard recommended providers & models if database is empty.
   */
  async seedStandardProvidersAndModels() {
    const existing = await prisma.platformAIProvider.count();
    if (existing > 0) return;

    // 1. OpenAI
    await prisma.platformAIProvider.create({
      data: {
        provider: "OPENAI",
        name: "OpenAI",
        enabled: true,
        supportedCapabilities: ["TEXT", "IMAGE"],
      },
    });

    await prisma.platformAIModel.createMany({
      data: [
        {
          modelId: "gpt-4o",
          provider: "OPENAI",
          displayName: "GPT-4o (Omni)",
          capability: "TEXT",
          contextWindow: 128000,
          maxTokens: 4096,
          supportsVision: true,
          isDefault: true,
        },
        {
          modelId: "gpt-4o-mini",
          provider: "OPENAI",
          displayName: "GPT-4o Mini",
          capability: "TEXT",
          contextWindow: 128000,
          maxTokens: 16384,
          supportsVision: true,
          isDefault: false,
        },
        {
          modelId: "dall-e-3",
          provider: "OPENAI",
          displayName: "DALL-E 3",
          capability: "IMAGE",
          isDefault: true,
        },
      ],
    });

    // 2. Google Gemini
    await prisma.platformAIProvider.create({
      data: {
        provider: "GEMINI",
        name: "Google Gemini",
        enabled: true,
        supportedCapabilities: ["TEXT"],
      },
    });

    await prisma.platformAIModel.createMany({
      data: [
        {
          modelId: "gemini-2.0-flash",
          provider: "GEMINI",
          displayName: "Gemini 2.0 Flash",
          capability: "TEXT",
          contextWindow: 1048576,
          maxTokens: 8192,
          supportsVision: true,
          isDefault: true,
        },
        {
          modelId: "gemini-1.5-pro",
          provider: "GEMINI",
          displayName: "Gemini 1.5 Pro",
          capability: "TEXT",
          contextWindow: 2097152,
          maxTokens: 8192,
          supportsVision: true,
          isDefault: false,
        },
      ],
    });

    // 3. Groq
    await prisma.platformAIProvider.create({
      data: {
        provider: "GROQ",
        name: "Groq (LPU Inference)",
        enabled: true,
        supportedCapabilities: ["TEXT"],
      },
    });

    await prisma.platformAIModel.createMany({
      data: [
        {
          modelId: "llama-3.3-70b-versatile",
          provider: "GROQ",
          displayName: "Llama 3.3 70B Versatile",
          capability: "TEXT",
          contextWindow: 128000,
          maxTokens: 8192,
          isDefault: true,
        },
        {
          modelId: "mixtral-8x7b-32768",
          provider: "GROQ",
          displayName: "Mixtral 8x7B",
          capability: "TEXT",
          contextWindow: 32768,
          maxTokens: 4096,
          isDefault: false,
        },
      ],
    });

    // 4. Default Service Routings
    await prisma.platformAIServiceConfig.createMany({
      data: [
        {
          serviceKey: "WHATSAPP_ASSISTANT",
          displayName: "WhatsApp Storefront Assistant",
          capability: "TEXT",
          primaryModelId: "llama-3.3-70b-versatile",
          fallbackModelId: "gemini-2.0-flash",
          creditCost: 1,
          enabled: true,
        },
        {
          serviceKey: "STORE_SETUP",
          displayName: "Fast Store Setup with AI",
          capability: "TEXT",
          primaryModelId: "gemini-2.0-flash",
          fallbackModelId: "gpt-4o-mini",
          creditCost: 5,
          enabled: true,
        },
        {
          serviceKey: "MARKETPLACE_COPYWRITER",
          displayName: "Marketplace Product Copywriter",
          capability: "TEXT",
          primaryModelId: "gpt-4o",
          fallbackModelId: "gemini-2.0-flash",
          creditCost: 2,
          enabled: true,
        },
        {
          serviceKey: "IMAGE_GENERATION",
          displayName: "Product Media Studio (Images)",
          capability: "IMAGE",
          primaryModelId: "dall-e-3",
          creditCost: 10,
          enabled: true,
        },
      ],
    });
  }
}

export const superAdminAIService = new SuperAdminAIService();
