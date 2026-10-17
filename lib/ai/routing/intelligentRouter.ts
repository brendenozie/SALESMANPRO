/**
 * lib/ai/routing/intelligentRouter.ts
 *
 * Authoritative Intelligent AI Model Orchestrator and Automatic Router for SalesmanPro.
 * Dynamically resolves, filters, and ranks AI models according to Super Admin policies,
 * budget constraints, task requirements, execution stages, and health telemetry.
 */

import prisma from "@/server/db/prismadb";
import { AICapability, AIProviderName } from "../types";
import { MODEL_CATALOG } from "../modelRegistry";
import { MODEL_PRICING_TABLE, ProviderPricingCalculator } from "./providerPricing";
import { AgentTaskRegistry } from "./agentTaskRegistry";
import {
  AIRoutingMode,
  AIModelQualityTier,
  AIAgentExecutionStage,
  RoutingCandidate,
  RoutingConstraints,
  CandidateEvaluation,
  RoutingDecision,
  GlobalRoutingPolicy,
} from "./types";
import { superAdminAIService } from "../superAdminService";

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

export class IntelligentRouter {
  private static circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private static defaultPolicy: GlobalRoutingPolicy = {
    version: 1,
    routingMode: "BALANCED",
    globalKillSwitch: false,
    deterministicAllowedGlobally: true,
    maxProviderCostPerCallUsd: 0.10, // $0.10 max per single execution
    monthlySpendLimitUsd: 500.0,
    dailySpendLimitUsd: 25.0,
    providerSpendingCaps: {},
    defaultFallbackModelId: "salesmanpro-deterministic-v1",
    circuitBreakerErrorRateThreshold: 0.3,
    circuitBreakerCooldownMs: 60_000, // 60s
    updatedAt: new Date().toISOString(),
  };

  /**
   * Records a provider failure to inform circuit-breaker decisions.
   */
  public static recordProviderFailure(provider: string) {
    const key = provider.toUpperCase();
    const current = this.circuitBreakers.get(key) || {
      failures: 0,
      lastFailureTime: 0,
      isOpen: false,
    };
    current.failures += 1;
    current.lastFailureTime = Date.now();
    if (current.failures >= 3) {
      current.isOpen = true;
    }
    this.circuitBreakers.set(key, current);
  }

  /**
   * Records a provider success, resetting consecutive failure counts.
   */
  public static recordProviderSuccess(provider: string) {
    const key = provider.toUpperCase();
    this.circuitBreakers.set(key, {
      failures: 0,
      lastFailureTime: 0,
      isOpen: false,
    });
  }

  /**
   * Checks if a provider is currently blocked by circuit-breaker.
   */
  public static isProviderCircuitOpen(provider: string): boolean {
    const key = provider.toUpperCase();
    const state = this.circuitBreakers.get(key);
    if (!state || !state.isOpen) return false;

    // Auto-reset if cooldown expired
    if (Date.now() - state.lastFailureTime > this.defaultPolicy.circuitBreakerCooldownMs) {
      state.isOpen = false;
      state.failures = 0;
      this.circuitBreakers.set(key, state);
      return false;
    }
    return true;
  }

  /**
   * Resets all provider circuit breakers to closed state.
   */
  public static resetCircuitBreakers() {
    this.circuitBreakers.clear();
  }

  /**
   * Resolves the active platform-wide routing policy from database or defaults.
   */
  public static async getGlobalPolicy(): Promise<GlobalRoutingPolicy> {
    try {
      const config = await prisma.platformAIServiceConfig.findUnique({
        where: { serviceKey: "PLATFORM_ROUTING_POLICY" },
      });
      if (config?.metadata && typeof config.metadata === "object") {
        return {
          ...this.defaultPolicy,
          ...(config.metadata as any),
        };
      }
    } catch {
      // Fallback to in-memory defaults
    }
    return this.defaultPolicy;
  }

  /**
   * Updates the platform-wide routing policy. Super Admin only.
   */
  public static async updateGlobalPolicy(
    update: Partial<GlobalRoutingPolicy>,
    adminEmail?: string,
  ): Promise<GlobalRoutingPolicy> {
    const current = await this.getGlobalPolicy();
    const updated: GlobalRoutingPolicy = {
      ...current,
      ...update,
      version: current.version + 1,
      lastUpdatedBy: adminEmail || "super-admin",
      updatedAt: new Date().toISOString(),
    };

    try {
      await prisma.platformAIServiceConfig.upsert({
        where: { serviceKey: "PLATFORM_ROUTING_POLICY" },
        update: {
          metadata: updated as any,
          primaryModelId: updated.defaultPinnedModelId || "salesmanpro-deterministic-v1",
          updatedAt: new Date(),
        },
        create: {
          serviceKey: "PLATFORM_ROUTING_POLICY",
          displayName: "Global Intelligent Routing Policy",
          capability: "TEXT",
          primaryModelId: updated.defaultPinnedModelId || "salesmanpro-deterministic-v1",
          metadata: updated as any,
        },
      });

      await prisma.aIAuditLog.create({
        data: {
          action: "ROUTING_POLICY_UPDATED",
          actorEmail: adminEmail || "super-admin",
          target: "GLOBAL_ROUTING_POLICY",
          details: { previousVersion: current.version, newVersion: updated.version, mode: updated.routingMode } as any,
        },
      });
    } catch (err) {
      console.warn("[ROUTER_UPDATE_POLICY_WARN]", err);
    }

    return updated;
  }

  /**
   * Main Orchestrator Resolution:
   * Evaluates task context, checks constraints, ranks eligible models,
   * constructs fallback chains, and returns an explainable decision.
   */
  public static async resolveOptimalModel(params: {
    actionId?: string;
    feature?: string;
    capability?: AICapability;
    agentKey?: string;
    stage?: AIAgentExecutionStage;
    prompt?: string;
    estimatedPromptTokens?: number;
    estimatedMaxOutputTokens?: number;
    allowDeterministic?: boolean;
    defaultPinnedModelId?: string;
    requiresJsonSchema?: boolean;
    requiresVision?: boolean;
    overrideMode?: AIRoutingMode;
    routingModeOverride?: AIRoutingMode;
  }): Promise<RoutingDecision> {
    const globalPolicy = await this.getGlobalPolicy();
    const actionId = params.actionId || params.feature || "GENERAL_TASK";
    const capability = params.capability || "TEXT";
    const agentDef = params.agentKey
      ? AgentTaskRegistry.getAgent(params.agentKey)
      : AgentTaskRegistry.findAgentForAction(actionId, params.feature);

    // 1. Resolve Super Admin Service Config (Pinned or Assigned)
    let dbConfig = await prisma.platformAIServiceConfig.findFirst({
      where: {
        OR: [
          { serviceKey: actionId },
          ...(params.feature ? [{ serviceKey: params.feature }] : []),
          { capability },
        ],
        enabled: true,
      },
    }).catch(() => null);

    // 2. Determine Effective Routing Mode
    let mode: AIRoutingMode = params.routingModeOverride || params.overrideMode || globalPolicy.routingMode || "BALANCED";

    // Agent Stage Override if specified and no explicit override given
    if (!params.routingModeOverride && !params.overrideMode && params.stage && agentDef?.stageConfigs?.[params.stage]) {
      mode = agentDef.stageConfigs[params.stage].preferredMode;
    }

    // Dynamic Automatic mode determination based on prompt complexity
    if (mode === "AUTOMATIC") {
      const promptLen = params.prompt?.length || 200;
      if (promptLen < 200 && !params.requiresVision) {
        mode = "COST_FIRST";
      } else if (promptLen > 2000 || params.prompt?.toLowerCase().includes("reason") || params.prompt?.toLowerCase().includes("analyze complex")) {
        mode = "QUALITY_FIRST";
      } else {
        mode = "BALANCED";
      }
    }

    // 3. Check Deterministic Suitability
    // If task is purely template/schema based or stage is VALIDATION_FORMAT, allow zero-cost deterministic engine
    const isDeterministicCandidateEligible =
      globalPolicy.deterministicAllowedGlobally &&
      (params.allowDeterministic !== false) &&
      (params.allowDeterministic === true ||
        agentDef?.deterministicSuitable ||
        params.stage === "VALIDATION_FORMAT" ||
        params.stage === "INTENT_CLASSIFICATION" ||
        actionId.includes("PRODUCT_DESCRIPTION") ||
        actionId.includes("PRODUCT_SEO") ||
        actionId.includes("PRODUCT_ATTRIBUTES") ||
        actionId.includes("DOCUMENT") ||
        actionId.includes("WHATSAPP") ||
        actionId.includes("LESSON") ||
        actionId.includes("SOCIAL"));

    // 4. Build Candidate Pool
    const candidates = await this.buildCandidatePool(capability);
    const estimatedPromptTokens =
      params.estimatedPromptTokens || (params.prompt ? Math.max(10, Math.ceil(params.prompt.length / 4)) : 250);
    const estimatedCompletionTokens = params.estimatedMaxOutputTokens || 800;

    const evaluations: CandidateEvaluation[] = [];

    for (const c of candidates) {
      const estCost = ProviderPricingCalculator.calculateCostUsd(
        c.modelId,
        estimatedPromptTokens,
        estimatedCompletionTokens,
      );

      // --- Hard Constraint Checking ---
      let eligible = true;
      let exclusionReason: string | undefined;

      // Constraint A: Circuit Breaker
      if (!c.isDeterministic && this.isProviderCircuitOpen(c.provider)) {
        eligible = false;
        exclusionReason = `Provider ${c.provider} circuit-breaker is open due to recent failures`;
      }

      // Constraint B: Provider Health & Decrypted Key
      if (eligible && !c.isDeterministic) {
        const hasKey = await superAdminAIService.getDecryptedApiKey(c.provider);
        if (!hasKey) {
          eligible = false;
          exclusionReason = `Provider ${c.provider} has no configured API key`;
        }
      }

      // Constraint C: Capability requirements
      if (eligible && params.requiresVision && !c.supportsVision) {
        eligible = false;
        exclusionReason = "Model does not support vision/multimodal input";
      }

      if (eligible && params.requiresJsonSchema && !c.supportsJsonSchema && !c.isDeterministic) {
        eligible = false;
        exclusionReason = "Model does not support strict JSON schema output";
      }

      // Constraint D: Cost ceiling
      if (eligible && estCost > globalPolicy.maxProviderCostPerCallUsd) {
        eligible = false;
        exclusionReason = `Estimated cost ($${estCost.toFixed(4)}) exceeds policy ceiling ($${globalPolicy.maxProviderCostPerCallUsd})`;
      }

      // Constraint E: Deterministic Constraints
      if (c.isDeterministic && !isDeterministicCandidateEligible) {
        eligible = false;
        exclusionReason = "Task is not eligible for deterministic execution (requires general language reasoning)";
      }

      // --- Calculate Composite Scoring ---
      let costScore = 0;
      let qualityScore = 0;
      let latencyScore = 0;
      let reliabilityScore = c.successRate;

      if (eligible) {
        // Cost Score: Lower cost = higher score (0 to 100)
        costScore = estCost === 0 ? 100 : Math.max(0, 100 - (estCost / 0.05) * 100);

        // Quality Score based on tier
        qualityScore =
          c.qualityTier === "FLAGSHIP" ? 98 :
          c.qualityTier === "PREMIUM" ? 92 :
          c.qualityTier === "STANDARD" ? 80 :
          c.isDeterministic ? 85 :
          c.qualityTier === "LOW_COST" ? 65 : 50;

        // Latency Score: Lower latency = higher score
        latencyScore = Math.max(10, 100 - (c.historicalLatencyMs / 50));
      }

      // Mode Weights
      let compositeScore = 0;
      if (eligible) {
        if (mode === "COST_FIRST") {
          compositeScore = (costScore * 0.70) + (qualityScore * 0.15) + (reliabilityScore * 100 * 0.15);
        } else if (mode === "QUALITY_FIRST") {
          compositeScore = (qualityScore * 0.70) + (costScore * 0.10) + (reliabilityScore * 100 * 0.20);
        } else if (mode === "PRIORITY_FIRST") {
          compositeScore = (latencyScore * 0.50) + (reliabilityScore * 100 * 0.30) + (qualityScore * 0.20);
        } else {
          // BALANCED (Default)
          compositeScore = (costScore * 0.35) + (qualityScore * 0.30) + (latencyScore * 0.20) + (reliabilityScore * 100 * 0.15);
        }
      }

      evaluations.push({
        modelId: c.modelId,
        provider: c.provider,
        eligible,
        exclusionReason,
        estimatedCostUsd: estCost,
        compositeScore: eligible ? Math.round(compositeScore) : 0,
        metrics: {
          costScore: Math.round(costScore),
          qualityScore: Math.round(qualityScore),
          latencyScore: Math.round(latencyScore),
          reliabilityScore: Math.round(reliabilityScore * 100),
        },
      });
    }

    // 5. Select Winning Candidate
    let eligibleEvaluations = evaluations.filter((e) => e.eligible).sort((a, b) => b.compositeScore - a.compositeScore);

    // If Super Admin explicitly PINNED a model, prioritize it if eligible
    const pinnedTarget = params.defaultPinnedModelId || dbConfig?.primaryModelId || globalPolicy.defaultPinnedModelId;
    if (mode === "PINNED" && pinnedTarget) {
      const pinnedEval = evaluations.find((e) => e.modelId === pinnedTarget && e.eligible);
      if (pinnedEval) {
        eligibleEvaluations = [pinnedEval, ...eligibleEvaluations.filter((e) => e.modelId !== pinnedEval.modelId)];
      }
    }

    let winner = eligibleEvaluations[0];

    // Extreme Fallback: Always guarantee salesmanpro-deterministic-v1 if all external models are ineligible
    if (!winner) {
      winner = {
        modelId: "salesmanpro-deterministic-v1",
        provider: "CUSTOM",
        eligible: true,
        estimatedCostUsd: 0,
        compositeScore: 50,
        metrics: { costScore: 100, qualityScore: 50, latencyScore: 100, reliabilityScore: 100 },
      };
    }

    // 6. Build Resilient Fallback Chain
    const fallbackChain: string[] = [];
    if (dbConfig?.fallbackModelId && dbConfig.fallbackModelId !== winner.modelId) {
      fallbackChain.push(dbConfig.fallbackModelId);
    }
    for (const e of eligibleEvaluations) {
      if (e.modelId !== winner.modelId && !fallbackChain.includes(e.modelId)) {
        fallbackChain.push(e.modelId);
      }
    }
    if (!fallbackChain.includes("salesmanpro-deterministic-v1")) {
      fallbackChain.push("salesmanpro-deterministic-v1");
    }

    const winningCandidate = candidates.find((c) => c.modelId === winner.modelId) || {
      qualityTier: "FREE" as AIModelQualityTier,
      isDeterministic: true,
      provider: "CUSTOM" as AIProviderName,
    };

    const reason = `Selected ${winner.modelId} via [${mode}] policy (score: ${winner.compositeScore}/100, est. cost: $${winner.estimatedCostUsd.toFixed(5)}). ${
      winner.modelId === "salesmanpro-deterministic-v1" ? "Zero-cost deterministic autonomous engine selected." : ""
    }`;

    return {
      selectedModelId: winner.modelId,
      selectedProvider: winner.provider,
      qualityTier: winningCandidate.qualityTier,
      routingMode: mode,
      reason,
      estimatedProviderCostUsd: winner.estimatedCostUsd,
      fallbackChain: fallbackChain.slice(0, 3), // Top 3 fallbacks
      evaluatedCandidates: evaluations,
      isDeterministic: winningCandidate.isDeterministic,
      executionStage: params.stage,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Constructs the full pool of potential candidate models.
   */
  private static async buildCandidatePool(capability: AICapability): Promise<RoutingCandidate[]> {
    const list: RoutingCandidate[] = [];

    for (const m of MODEL_CATALOG) {
      if (m.capability !== capability && capability !== "TEXT") continue;

      const pricing = MODEL_PRICING_TABLE[m.id] || { inputPer1MUsd: 1.0, outputPer1MUsd: 2.0 };
      const isDet = m.id === "salesmanpro-deterministic-v1";

      let tier: AIModelQualityTier = "LOW_COST";
      if (isDet) tier = "FREE";
      else if (m.id === "gpt-4o" || pricing.inputPer1MUsd >= 2.5) tier = "FLAGSHIP";
      else if (pricing.inputPer1MUsd >= 1.5) tier = "PREMIUM";
      else if (pricing.inputPer1MUsd >= 0.3) tier = "STANDARD";

      const latencyMs = isDet ? 15 : m.provider === "GROQ" ? 450 : m.provider === "GEMINI" ? 800 : 1500;

      list.push({
        modelId: m.id,
        provider: m.provider,
        displayName: m.displayName,
        qualityTier: tier,
        capabilities: [m.capability],
        supportsJsonSchema: Boolean(m.supportsJsonSchema),
        supportsVision: Boolean(m.supportsVision),
        contextWindow: m.contextWindow || 8192,
        maxTokens: m.maxTokens || 4096,
        pricing,
        isDeterministic: isDet,
        isHealthy: !this.isProviderCircuitOpen(m.provider),
        historicalLatencyMs: latencyMs,
        successRate: isDet ? 1.0 : 0.98,
      });
    }

    return list;
  }
}
