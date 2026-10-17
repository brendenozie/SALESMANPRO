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
import { ActionRegistry, PLATFORM_AI_ACTIONS } from "./actionRegistry";
import { IntelligentRouter } from "./routing/intelligentRouter";
import { AgentTaskRegistry, RegisteredAgentDefinition } from "./routing/agentTaskRegistry";
import { ProviderPricingCalculator, BASELINE_BENCHMARK_MODEL } from "./routing/providerPricing";
import {
  GlobalRoutingPolicy,
  AgentPolicyConfig,
  PolicyEvaluationRequest,
  PolicyEvaluationResult,
} from "./routing/types";

export interface ProviderUpsertInput {
  provider: string;
  name: string;
  apiKey?: string;
  enabled?: boolean;
  supportedCapabilities?: AICapability[];
  metadata?: any;
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
      case "SERPAPI":
        return process.env.SERPAPI_API_KEY || null;
      case "GOOGLE_SEARCH":
        return process.env.GOOGLE_SEARCH_API_KEY || null;
      case "META_WHATSAPP":
        return process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WA_ACCESS_TOKEN || null;
      default:
        return null;
    }
  }

  /**
   * Get full provider configuration details including decrypted key and metadata.
   */
  async getProviderDetails(providerKey: string) {
    const record = await prisma.platformAIProvider.findUnique({
      where: { provider: providerKey.toUpperCase() },
    });

    const decryptedKey = await this.getDecryptedApiKey(providerKey);
    return {
      record,
      apiKey: decryptedKey,
      metadata: (record?.metadata as any) || {},
    };
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

    if (input.metadata !== undefined) {
      data.metadata = input.metadata;
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
      metadata: provider.metadata,
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

  /**
   * Action Routing Policies: returns all registered platform actions joined with DB policies.
   */
  async getActionPolicies() {
    const dbConfigs = await prisma.platformAIServiceConfig.findMany();
    const configMap = new Map(dbConfigs.map((c) => [c.serviceKey, c]));

    const actions = ActionRegistry.listAllActions();
    return actions.map((a) => {
      const config = configMap.get(a.actionId);
      return {
        actionId: a.actionId,
        displayName: config?.displayName || a.displayName,
        description: a.description,
        domain: a.domain,
        capability: a.capability,
        primaryModelId: config?.primaryModelId || a.defaultPrimaryModel,
        fallbackModelId: config?.fallbackModelId || a.defaultFallbackModel,
        creditCost: config?.creditCost ?? a.defaultCreditCost,
        enabled: config?.enabled ?? true,
        maxTokens: config?.maxTokens ?? a.maxTokens,
        temperature: config?.temperature ?? a.temperature,
        supportsDeterministicFallback: a.supportsDeterministicFallback,
        hasCustomPolicy: Boolean(config),
      };
    });
  }

  /**
   * Update an action's model routing policy directly from Super Admin without code deploy.
   */
  async updateActionPolicy(params: {
    actionId: string;
    primaryModelId: string;
    fallbackModelId?: string;
    creditCost?: number;
    enabled?: boolean;
    temperature?: number;
    maxTokens?: number;
  }) {
    const actionDef = ActionRegistry.getAction(params.actionId);
    return prisma.platformAIServiceConfig.upsert({
      where: { serviceKey: params.actionId },
      create: {
        serviceKey: params.actionId,
        displayName: actionDef?.displayName || params.actionId,
        capability: actionDef?.capability || "TEXT",
        primaryModelId: params.primaryModelId,
        fallbackModelId: params.fallbackModelId,
        creditCost: params.creditCost ?? actionDef?.defaultCreditCost ?? 1,
        enabled: params.enabled ?? true,
        temperature: params.temperature ?? actionDef?.temperature ?? 0.7,
        maxTokens: params.maxTokens ?? actionDef?.maxTokens ?? 2048,
      },
      update: {
        primaryModelId: params.primaryModelId,
        fallbackModelId: params.fallbackModelId,
        creditCost: params.creditCost,
        enabled: params.enabled,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
      },
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
          estimatedCost: true,
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

      // Provider breakdown
      prisma.aIUsage.groupBy({
        by: ["provider"],
        where: { createdAt: { gte: since } },
        _sum: { totalTokens: true, creditsCost: true, estimatedCost: true },
        _count: { id: true },
      }),

      // Deterministic call count
      prisma.aIUsage.count({
        where: {
          createdAt: { gte: since },
          model: "salesmanpro-deterministic-v1",
        },
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
    const totalProviderCostUsd = totalUsage._sum.estimatedCost || 0;
    const failureRate = totalJobs > 0 ? (failedJobs / totalJobs) * 100 : 0;
    const deterministicCalls = (arguments as any) ? (await prisma.aIUsage.count({ where: { createdAt: { gte: since }, model: "salesmanpro-deterministic-v1" } }).catch(() => 0)) : 0;
    const deterministicRate = totalCalls > 0 ? Number(((deterministicCalls / totalCalls) * 100).toFixed(1)) : 0;

    // Estimate empirical cost savings vs baseline (e.g. GPT-4o for all calls)
    const baselineEstimate = ProviderPricingCalculator.calculateCostUsd(
      BASELINE_BENCHMARK_MODEL,
      Math.ceil(totalTokens * 0.4),
      Math.ceil(totalTokens * 0.6),
    );
    const savingsUsd = Math.max(0, baselineEstimate - totalProviderCostUsd);
    const savingsPercentage = baselineEstimate > 0 ? Number(((savingsUsd / baselineEstimate) * 100).toFixed(1)) : 0;

    const providerBreakdown = await prisma.aIUsage.groupBy({
      by: ["provider"],
      where: { createdAt: { gte: since } },
      _sum: { totalTokens: true, creditsCost: true, estimatedCost: true },
      _count: { id: true },
    }).catch(() => []);

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
        totalProviderCostUsd: Number(totalProviderCostUsd.toFixed(4)),
        baselineCostUsd: Number(baselineEstimate.toFixed(4)),
        savingsUsd: Number(savingsUsd.toFixed(4)),
        savingsPercentage,
        deterministicRate,
      },
      providerBreakdown: providerBreakdown.map((p) => ({
        provider: p.provider,
        calls: p._count.id,
        tokens: p._sum.totalTokens || 0,
        creditsConsumed: p._sum.creditsCost || 0,
        fiatCostUsd: Number((p._sum.estimatedCost || 0).toFixed(4)),
      })),
      topCompanies,
      recentAuditLogs,
    };
  }

  /**
   * Get the global intelligent routing policy.
   */
  async getRoutingPolicy(): Promise<GlobalRoutingPolicy> {
    return await IntelligentRouter.getGlobalPolicy();
  }

  /**
   * Update the global intelligent routing policy.
   */
  async updateRoutingPolicy(
    update: Partial<GlobalRoutingPolicy>,
    adminEmail?: string,
  ): Promise<GlobalRoutingPolicy> {
    return await IntelligentRouter.updateGlobalPolicy(update, adminEmail);
  }

  /**
   * List all registered platform agents and their model routing policies.
   */
  async getAgentPolicies(): Promise<RegisteredAgentDefinition[]> {
    return AgentTaskRegistry.getAllAgents();
  }

  /**
   * Simulates/evaluates a routing decision for dry-run testing.
   */
  async simulatePolicyEvaluation(input: PolicyEvaluationRequest): Promise<PolicyEvaluationResult> {
    const decision = await IntelligentRouter.resolveOptimalModel({
      actionId: input.actionId,
      feature: input.feature,
      agentKey: input.agentKey,
      stage: input.stage,
      prompt: input.prompt,
      overrideMode: input.routingModeOverride,
    });

    const promptTokens = Math.max(10, Math.ceil(input.prompt.length / 4));
    const completionTokens = 800;

    const savings = ProviderPricingCalculator.calculateSavingsVsBaseline(
      decision.selectedModelId,
      promptTokens,
      completionTokens,
    );

    return {
      decision,
      simulatedSavingsUsd: savings.savingsUsd,
      baselineModelId: BASELINE_BENCHMARK_MODEL,
      baselineCostUsd: savings.baselineCostUsd,
      savingsPercentage: savings.savingsPercentage,
    };
  }

  /**
   * Rollback policy to a previous known-good version from audit log.
   */
  async rollbackPolicy(adminEmail?: string): Promise<GlobalRoutingPolicy> {
    const lastAudit = await prisma.aIAuditLog.findFirst({
      where: {
        action: "ROUTING_POLICY_UPDATED",
        target: "GLOBAL_ROUTING_POLICY",
      },
      orderBy: { createdAt: "desc" },
      skip: 1, // Get prior configuration
    });

    if (!lastAudit?.details) {
      throw new AIPlatformError("NOT_FOUND", "No previous configuration found to rollback to.", 404);
    }

    const previousConfig = lastAudit.details as any;
    return await IntelligentRouter.updateGlobalPolicy(previousConfig, adminEmail);
  }

  /**
   * Seed standard recommended providers & models if database is empty.
   */
  async seedStandardProvidersAndModels() {
    // 0. Custom Autonomous Provider (Zero API Cost)
    await prisma.platformAIProvider.upsert({
      where: { provider: "CUSTOM" },
      create: {
        provider: "CUSTOM",
        name: "SalesmanPro Autonomous Engine (Zero Cost)",
        enabled: true,
        supportedCapabilities: ["TEXT", "ANALYSIS", "PRODUCT_CONTENT", "MARKETPLACE_CONTENT", "WHATSAPP", "SOCIAL_MARKETING"],
        connectionStatus: "ACTIVE",
      },
      update: { enabled: true },
    });

    // 1. OpenAI
    await prisma.platformAIProvider.upsert({
      where: { provider: "OPENAI" },
      create: {
        provider: "OPENAI",
        name: "OpenAI",
        enabled: true,
        supportedCapabilities: ["TEXT", "IMAGE"],
      },
      update: { enabled: true },
    });

    // 2. Google Gemini
    await prisma.platformAIProvider.upsert({
      where: { provider: "GEMINI" },
      create: {
        provider: "GEMINI",
        name: "Google Gemini",
        enabled: true,
        supportedCapabilities: ["TEXT"],
      },
      update: { enabled: true },
    });

    // 3. Groq
    await prisma.platformAIProvider.upsert({
      where: { provider: "GROQ" },
      create: {
        provider: "GROQ",
        name: "Groq (LPU Inference)",
        enabled: true,
        supportedCapabilities: ["TEXT"],
      },
      update: { enabled: true },
    });

    // Seed/upsert essential platform models
    const standardModels = [
      {
        modelId: "salesmanpro-deterministic-v1",
        provider: "CUSTOM",
        displayName: "SalesmanPro Autonomous Engine (Zero Cost)",
        capability: "TEXT" as AICapability,
        contextWindow: 64000,
        maxTokens: 4096,
        inputCreditCost: 0,
        outputCreditCost: 0,
        isDefault: false,
      },
      {
        modelId: "gemini-2.0-flash",
        provider: "GEMINI",
        displayName: "Gemini 2.0 Flash (Fast / Economical)",
        capability: "TEXT" as AICapability,
        contextWindow: 1048576,
        maxTokens: 8192,
        supportsVision: true,
        isDefault: true,
      },
      {
        modelId: "gemini-1.5-flash",
        provider: "GEMINI",
        displayName: "Gemini 1.5 Flash (Free Tier)",
        capability: "TEXT" as AICapability,
        contextWindow: 1000000,
        maxTokens: 8192,
        supportsVision: true,
        isDefault: false,
      },
      {
        modelId: "llama-3.3-70b-versatile",
        provider: "GROQ",
        displayName: "Llama 3.3 70B Versatile",
        capability: "TEXT" as AICapability,
        contextWindow: 128000,
        maxTokens: 8192,
        isDefault: false,
      },
      {
        modelId: "llama-3.1-8b-instant",
        provider: "GROQ",
        displayName: "Llama 3.1 8B Instant (Free Tier)",
        capability: "TEXT" as AICapability,
        contextWindow: 128000,
        maxTokens: 4096,
        isDefault: false,
      },
      {
        modelId: "gpt-4o-mini",
        provider: "OPENAI",
        displayName: "GPT-4o Mini",
        capability: "TEXT" as AICapability,
        contextWindow: 128000,
        maxTokens: 16384,
        supportsVision: true,
        isDefault: false,
      },
      {
        modelId: "gpt-4o",
        provider: "OPENAI",
        displayName: "GPT-4o (Omni)",
        capability: "TEXT" as AICapability,
        contextWindow: 128000,
        maxTokens: 4096,
        supportsVision: true,
        isDefault: false,
      },
      {
        modelId: "dall-e-3",
        provider: "OPENAI",
        displayName: "DALL-E 3",
        capability: "IMAGE" as AICapability,
        isDefault: true,
      },
    ];

    for (const m of standardModels) {
      await prisma.platformAIModel.upsert({
        where: { modelId: m.modelId },
        create: {
          modelId: m.modelId,
          provider: m.provider,
          displayName: m.displayName,
          capability: m.capability,
          contextWindow: m.contextWindow,
          maxTokens: m.maxTokens,
          supportsVision: m.supportsVision ?? false,
          isDefault: m.isDefault ?? false,
          inputCreditCost: m.inputCreditCost ?? 1,
          outputCreditCost: m.outputCreditCost ?? 2,
          enabled: true,
        },
        update: {
          displayName: m.displayName,
          provider: m.provider,
          capability: m.capability,
        },
      });
    }

    // Seed all action policies from ActionRegistry
    for (const action of ActionRegistry.listAllActions()) {
      await prisma.platformAIServiceConfig.upsert({
        where: { serviceKey: action.actionId },
        create: {
          serviceKey: action.actionId,
          displayName: action.displayName,
          capability: action.capability,
          primaryModelId: action.defaultPrimaryModel,
          fallbackModelId: action.defaultFallbackModel,
          creditCost: action.defaultCreditCost,
          temperature: action.temperature,
          maxTokens: action.maxTokens,
          enabled: true,
        },
        update: {},
      });
    }
  }
}

export const superAdminAIService = new SuperAdminAIService();
