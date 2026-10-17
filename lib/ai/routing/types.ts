/**
 * lib/ai/routing/types.ts
 *
 * Core TypeScript contracts and schemas for SalesmanPro Intelligent AI Model Orchestrator,
 * Automatic Agent Routing, and Platform-Wide Cost Optimization.
 */

import { AICapability, AIProviderName } from "../types";

export type AIRoutingMode =
  | "COST_FIRST"      // Lowest fiat provider cost meeting minimum quality/schema requirements
  | "BALANCED"        // Optimal trade-off between cost, measured quality, latency, and reliability
  | "QUALITY_FIRST"   // Strongest eligible reasoning model within configured budget
  | "PRIORITY_FIRST"  // Lowest latency and highest uptime for mission-critical paths
  | "PINNED"          // Strict administrator-assigned model with explicit fallback only
  | "AUTOMATIC";      // Dynamic multi-factor task-complexity evaluation

export type AIModelQualityTier = "FREE" | "LOW_COST" | "STANDARD" | "PREMIUM" | "FLAGSHIP";

export type AIAgentExecutionStage =
  | "INTENT_CLASSIFICATION" // Fast intent / classification step
  | "TOOL_SELECTION"        // Autonomous tool-calling step
  | "CONTENT_GENERATION"   // Heavy creative or reasoning generation
  | "DATA_SYNTHESIS"       // Document parsing or arithmetic transformation
  | "VALIDATION_FORMAT";   // Strict JSON schema validation and sanitization

export interface ModelPricing {
  inputPer1MUsd: number;
  outputPer1MUsd: number;
  fixedCostPerUnitUsd?: number;
}

export interface RoutingCandidate {
  modelId: string;
  provider: AIProviderName;
  displayName: string;
  qualityTier: AIModelQualityTier;
  capabilities: AICapability[];
  supportsJsonSchema: boolean;
  supportsVision: boolean;
  contextWindow: number;
  maxTokens: number;
  pricing: ModelPricing;
  isDeterministic: boolean;
  isHealthy: boolean;
  historicalLatencyMs: number;
  successRate: number; // 0.0 - 1.0
}

export interface RoutingConstraints {
  requiredCapability: AICapability;
  requiresJsonSchema?: boolean;
  requiresVision?: boolean;
  estimatedPromptTokens?: number;
  estimatedMaxOutputTokens?: number;
  maxAcceptableLatencyMs?: number;
  maxAllowedProviderCostUsd?: number;
  allowDeterministic?: boolean;
  priority?: number; // 1 (low) to 5 (urgent)
  stage?: AIAgentExecutionStage;
}

export interface CandidateEvaluation {
  modelId: string;
  provider: AIProviderName;
  eligible: boolean;
  exclusionReason?: string;
  estimatedCostUsd: number;
  compositeScore: number;
  metrics: {
    costScore: number;
    qualityScore: number;
    latencyScore: number;
    reliabilityScore: number;
  };
}

export interface RoutingDecision {
  selectedModelId: string;
  selectedProvider: AIProviderName;
  qualityTier: AIModelQualityTier;
  routingMode: AIRoutingMode;
  reason: string;
  estimatedProviderCostUsd: number;
  fallbackChain: string[];
  evaluatedCandidates: CandidateEvaluation[];
  isDeterministic: boolean;
  executionStage?: AIAgentExecutionStage;
  timestamp: string;
}

export interface AgentPolicyConfig {
  agentKey: string;
  displayName: string;
  defaultMode: AIRoutingMode;
  pinnedModelId?: string;
  fallbackModelId?: string;
  allowDeterministic: boolean;
  stagePolicies?: Partial<Record<AIAgentExecutionStage, {
    mode: AIRoutingMode;
    preferredModelId?: string;
    allowDeterministic?: boolean;
  }>>;
  maxDailyCostUsd?: number;
  maxLatencyMs?: number;
  enabled: boolean;
}

export interface GlobalRoutingPolicy {
  version: number;
  routingMode: AIRoutingMode;
  globalKillSwitch: boolean;
  deterministicAllowedGlobally: boolean;
  maxProviderCostPerCallUsd: number;
  monthlySpendLimitUsd: number;
  dailySpendLimitUsd: number;
  providerSpendingCaps: Record<string, { dailyUsd: number; monthlyUsd: number; enabled: boolean }>;
  defaultFallbackModelId: string;
  defaultPinnedModelId?: string;
  circuitBreakerErrorRateThreshold: number; // e.g. 0.3 (30% failure triggers temporary bypass)
  circuitBreakerCooldownMs: number;        // e.g. 60000 (1 minute cooldown)
  lastUpdatedBy?: string;
  updatedAt: string;
}

export interface PolicyEvaluationRequest {
  actionId?: string;
  feature?: string;
  agentKey?: string;
  stage?: AIAgentExecutionStage;
  prompt: string;
  routingModeOverride?: AIRoutingMode;
}

export interface PolicyEvaluationResult {
  decision: RoutingDecision;
  simulatedSavingsUsd: number;
  baselineModelId: string;
  baselineCostUsd: number;
  savingsPercentage: number;
}
