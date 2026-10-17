/**
 * lib/ai/routing/providerPricing.ts
 *
 * Official and verified fiat provider pricing tables (in USD).
 * Separates real platform AI operational expenditure from tenant credit pricing.
 */

import { ModelPricing } from "./types";

export const MODEL_PRICING_TABLE: Record<string, ModelPricing> = {
  // Deterministic Engine (In-Memory, Zero-Cost)
  "salesmanpro-deterministic-v1": {
    inputPer1MUsd: 0.0,
    outputPer1MUsd: 0.0,
    fixedCostPerUnitUsd: 0.0,
  },

  // Groq LPU Inference (Official Groq API rates)
  "llama-3.3-70b-versatile": {
    inputPer1MUsd: 0.59,
    outputPer1MUsd: 0.79,
  },
  "llama-3.1-8b-instant": {
    inputPer1MUsd: 0.05,
    outputPer1MUsd: 0.08,
  },

  // Google Gemini API (Official Google DeepMind / Cloud pricing)
  "gemini-2.0-flash": {
    inputPer1MUsd: 0.10,
    outputPer1MUsd: 0.40,
  },
  "gemini-1.5-pro": {
    inputPer1MUsd: 1.25,
    outputPer1MUsd: 5.00,
  },

  // OpenAI API (Official OpenAI API rates)
  "gpt-4o-mini": {
    inputPer1MUsd: 0.15,
    outputPer1MUsd: 0.60,
  },
  "gpt-4o": {
    inputPer1MUsd: 2.50,
    outputPer1MUsd: 10.00,
  },

  // Media Models
  "dall-e-3": {
    inputPer1MUsd: 0.0,
    outputPer1MUsd: 0.0,
    fixedCostPerUnitUsd: 0.04, // $0.040 per 1024x1024 standard
  },
  "dall-e-2": {
    inputPer1MUsd: 0.0,
    outputPer1MUsd: 0.0,
    fixedCostPerUnitUsd: 0.02, // $0.020 per image
  },
  "stability-core": {
    inputPer1MUsd: 0.0,
    outputPer1MUsd: 0.0,
    fixedCostPerUnitUsd: 0.03,
  },
};

/**
 * Baseline model used for empirical cost savings comparisons (legacy standard GPT-4o).
 */
export const BASELINE_BENCHMARK_MODEL = "gpt-4o";

export class ProviderPricingCalculator {
  /**
   * Calculates actual or estimated provider fiat cost in USD.
   */
  public static calculateCostUsd(
    modelId: string,
    promptTokens: number,
    completionTokens: number,
    units: number = 0,
  ): number {
    const pricing = MODEL_PRICING_TABLE[modelId] || {
      inputPer1MUsd: 0.50,
      outputPer1MUsd: 1.50,
    };

    if (pricing.fixedCostPerUnitUsd && units > 0) {
      return Number((pricing.fixedCostPerUnitUsd * units).toFixed(6));
    }

    const inputCost = (promptTokens / 1_000_000) * pricing.inputPer1MUsd;
    const outputCost = (completionTokens / 1_000_000) * pricing.outputPer1MUsd;
    return Number((inputCost + outputCost).toFixed(7));
  }

  /**
   * Compares the cost of a selected model against the benchmark baseline (e.g. GPT-4o)
   * to determine real, non-hypothetical expenditure reduction.
   */
  public static calculateSavingsVsBaseline(
    selectedModelId: string,
    promptTokens: number,
    completionTokens: number,
  ): {
    actualCostUsd: number;
    baselineCostUsd: number;
    savingsUsd: number;
    savingsPercentage: number;
  } {
    const actualCostUsd = this.calculateCostUsd(selectedModelId, promptTokens, completionTokens);
    const baselineCostUsd = this.calculateCostUsd(BASELINE_BENCHMARK_MODEL, promptTokens, completionTokens);
    const savingsUsd = Math.max(0, baselineCostUsd - actualCostUsd);
    const savingsPercentage = baselineCostUsd > 0
      ? Number(((savingsUsd / baselineCostUsd) * 100).toFixed(2))
      : 0;

    return {
      actualCostUsd,
      baselineCostUsd,
      savingsUsd: Number(savingsUsd.toFixed(6)),
      savingsPercentage,
    };
  }
}
