"use strict";
/**
 * lib/ai/routing/intelligentRouter.ts
 *
 * Authoritative Intelligent AI Model Orchestrator and Automatic Router for SalesmanPro.
 * Dynamically resolves, filters, and ranks AI models according to Super Admin policies,
 * budget constraints, task requirements, execution stages, and health telemetry.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligentRouter = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const modelRegistry_1 = require("../modelRegistry");
const providerPricing_1 = require("./providerPricing");
const agentTaskRegistry_1 = require("./agentTaskRegistry");
const superAdminService_1 = require("../superAdminService");
class IntelligentRouter {
    static circuitBreakers = new Map();
    static defaultPolicy = {
        version: 1,
        routingMode: "BALANCED",
        globalKillSwitch: false,
        deterministicAllowedGlobally: true,
        maxProviderCostPerCallUsd: 0.10,
        monthlySpendLimitUsd: 500.0,
        dailySpendLimitUsd: 25.0,
        providerSpendingCaps: {},
        defaultFallbackModelId: "salesmanpro-deterministic-v1",
        circuitBreakerErrorRateThreshold: 0.3,
        circuitBreakerCooldownMs: 60_000,
        updatedAt: new Date().toISOString(),
    };
    /**
     * Records a provider failure to inform circuit-breaker decisions.
     */
    static recordProviderFailure(provider) {
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
    static recordProviderSuccess(provider) {
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
    static isProviderCircuitOpen(provider) {
        const key = provider.toUpperCase();
        const state = this.circuitBreakers.get(key);
        if (!state || !state.isOpen)
            return false;
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
    static resetCircuitBreakers() {
        this.circuitBreakers.clear();
    }
    /**
     * Resolves the active platform-wide routing policy from database or defaults.
     */
    static async getGlobalPolicy() {
        try {
            const config = await prismadb_1.default.platformAIServiceConfig.findUnique({
                where: { serviceKey: "PLATFORM_ROUTING_POLICY" },
            });
            if (config?.metadata && typeof config.metadata === "object") {
                return {
                    ...this.defaultPolicy,
                    ...config.metadata,
                };
            }
        }
        catch {
            // Fallback to in-memory defaults
        }
        return this.defaultPolicy;
    }
    /**
     * Updates the platform-wide routing policy. Super Admin only.
     */
    static async updateGlobalPolicy(update, adminEmail) {
        const current = await this.getGlobalPolicy();
        const updated = {
            ...current,
            ...update,
            version: current.version + 1,
            lastUpdatedBy: adminEmail || "super-admin",
            updatedAt: new Date().toISOString(),
        };
        try {
            await prismadb_1.default.platformAIServiceConfig.upsert({
                where: { serviceKey: "PLATFORM_ROUTING_POLICY" },
                update: {
                    metadata: updated,
                    primaryModelId: updated.defaultPinnedModelId || "salesmanpro-deterministic-v1",
                    updatedAt: new Date(),
                },
                create: {
                    serviceKey: "PLATFORM_ROUTING_POLICY",
                    displayName: "Global Intelligent Routing Policy",
                    capability: "TEXT",
                    primaryModelId: updated.defaultPinnedModelId || "salesmanpro-deterministic-v1",
                    metadata: updated,
                },
            });
            await prismadb_1.default.aIAuditLog.create({
                data: {
                    action: "ROUTING_POLICY_UPDATED",
                    actorEmail: adminEmail || "super-admin",
                    target: "GLOBAL_ROUTING_POLICY",
                    details: { previousVersion: current.version, newVersion: updated.version, mode: updated.routingMode },
                },
            });
        }
        catch (err) {
            console.warn("[ROUTER_UPDATE_POLICY_WARN]", err);
        }
        return updated;
    }
    /**
     * Main Orchestrator Resolution:
     * Evaluates task context, checks constraints, ranks eligible models,
     * constructs fallback chains, and returns an explainable decision.
     */
    static async resolveOptimalModel(params) {
        const globalPolicy = await this.getGlobalPolicy();
        const actionId = params.actionId || params.feature || "GENERAL_TASK";
        const capability = params.capability || "TEXT";
        const agentDef = params.agentKey
            ? agentTaskRegistry_1.AgentTaskRegistry.getAgent(params.agentKey)
            : agentTaskRegistry_1.AgentTaskRegistry.findAgentForAction(actionId, params.feature);
        // 1. Resolve Super Admin Service Config (Pinned or Assigned)
        let dbConfig = await prismadb_1.default.platformAIServiceConfig.findFirst({
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
        let mode = params.routingModeOverride || params.overrideMode || globalPolicy.routingMode || "BALANCED";
        // Agent Stage Override if specified and no explicit override given
        if (!params.routingModeOverride && !params.overrideMode && params.stage && agentDef?.stageConfigs?.[params.stage]) {
            mode = agentDef.stageConfigs[params.stage].preferredMode;
        }
        // Dynamic Automatic mode determination based on prompt complexity
        if (mode === "AUTOMATIC") {
            const promptLen = params.prompt?.length || 200;
            if (promptLen < 200 && !params.requiresVision) {
                mode = "COST_FIRST";
            }
            else if (promptLen > 2000 || params.prompt?.toLowerCase().includes("reason") || params.prompt?.toLowerCase().includes("analyze complex")) {
                mode = "QUALITY_FIRST";
            }
            else {
                mode = "BALANCED";
            }
        }
        // 3. Check Deterministic Suitability
        // If task is purely template/schema based or stage is VALIDATION_FORMAT, allow zero-cost deterministic engine
        const isDeterministicCandidateEligible = globalPolicy.deterministicAllowedGlobally &&
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
        const estimatedPromptTokens = params.estimatedPromptTokens || (params.prompt ? Math.max(10, Math.ceil(params.prompt.length / 4)) : 250);
        const estimatedCompletionTokens = params.estimatedMaxOutputTokens || 800;
        const evaluations = [];
        for (const c of candidates) {
            const estCost = providerPricing_1.ProviderPricingCalculator.calculateCostUsd(c.modelId, estimatedPromptTokens, estimatedCompletionTokens);
            // --- Hard Constraint Checking ---
            let eligible = true;
            let exclusionReason;
            // Constraint A: Circuit Breaker
            if (!c.isDeterministic && this.isProviderCircuitOpen(c.provider)) {
                eligible = false;
                exclusionReason = `Provider ${c.provider} circuit-breaker is open due to recent failures`;
            }
            // Constraint B: Provider Health & Decrypted Key
            if (eligible && !c.isDeterministic) {
                const hasKey = await superAdminService_1.superAdminAIService.getDecryptedApiKey(c.provider);
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
                }
                else if (mode === "QUALITY_FIRST") {
                    compositeScore = (qualityScore * 0.70) + (costScore * 0.10) + (reliabilityScore * 100 * 0.20);
                }
                else if (mode === "PRIORITY_FIRST") {
                    compositeScore = (latencyScore * 0.50) + (reliabilityScore * 100 * 0.30) + (qualityScore * 0.20);
                }
                else {
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
        const fallbackChain = [];
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
            qualityTier: "FREE",
            isDeterministic: true,
            provider: "CUSTOM",
        };
        const reason = `Selected ${winner.modelId} via [${mode}] policy (score: ${winner.compositeScore}/100, est. cost: $${winner.estimatedCostUsd.toFixed(5)}). ${winner.modelId === "salesmanpro-deterministic-v1" ? "Zero-cost deterministic autonomous engine selected." : ""}`;
        return {
            selectedModelId: winner.modelId,
            selectedProvider: winner.provider,
            qualityTier: winningCandidate.qualityTier,
            routingMode: mode,
            reason,
            estimatedProviderCostUsd: winner.estimatedCostUsd,
            fallbackChain: fallbackChain.slice(0, 3),
            evaluatedCandidates: evaluations,
            isDeterministic: winningCandidate.isDeterministic,
            executionStage: params.stage,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Constructs the full pool of potential candidate models.
     */
    static async buildCandidatePool(capability) {
        const list = [];
        for (const m of modelRegistry_1.MODEL_CATALOG) {
            if (m.capability !== capability && capability !== "TEXT")
                continue;
            const pricing = providerPricing_1.MODEL_PRICING_TABLE[m.id] || { inputPer1MUsd: 1.0, outputPer1MUsd: 2.0 };
            const isDet = m.id === "salesmanpro-deterministic-v1";
            let tier = "LOW_COST";
            if (isDet)
                tier = "FREE";
            else if (m.id === "gpt-4o" || pricing.inputPer1MUsd >= 2.5)
                tier = "FLAGSHIP";
            else if (pricing.inputPer1MUsd >= 1.5)
                tier = "PREMIUM";
            else if (pricing.inputPer1MUsd >= 0.3)
                tier = "STANDARD";
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
exports.IntelligentRouter = IntelligentRouter;
