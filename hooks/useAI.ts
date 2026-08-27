/**
 * hooks/useAI.ts
 *
 * TanStack React Query Hooks for SalesmanPro AI Platform.
 * Provides caching, optimistic updates, background polling, and mutation handlers.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiClient } from "@/lib/api/aiClient";
import {
  AITextGenerationInput,
  AIImageGenerationInput,
  AIVideoGenerationInput,
} from "@/lib/ai/types";

export const AI_QUERY_KEYS = {
  models: (capability?: string) => ["ai", "models", capability ?? "all"],
  credits: () => ["ai", "credits"],
  transactions: (page: number, limit: number) => ["ai", "transactions", page, limit],
  usage: (timeframe: string) => ["ai", "usage", timeframe],
  generations: (page: number, limit: number, capability?: string) => [
    "ai",
    "generations",
    page,
    limit,
    capability ?? "all",
  ],
  generationJob: (jobId: string) => ["ai", "generation", jobId],
};

export function useAIModels(capability?: string) {
  return useQuery({
    queryKey: AI_QUERY_KEYS.models(capability),
    queryFn: () => aiClient.getModels(capability),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAICredits() {
  return useQuery({
    queryKey: AI_QUERY_KEYS.credits(),
    queryFn: () => aiClient.getCredits(),
    staleTime: 30 * 1000,
  });
}

export function useAICreditTransactions(page = 1, limit = 20) {
  return useQuery({
    queryKey: AI_QUERY_KEYS.transactions(page, limit),
    queryFn: () => aiClient.getTransactions(page, limit),
    staleTime: 30 * 1000,
  });
}

export function useAIUsageAnalytics(timeframe = "month") {
  return useQuery({
    queryKey: AI_QUERY_KEYS.usage(timeframe),
    queryFn: () => aiClient.getUsage(timeframe),
    staleTime: 60 * 1000,
  });
}

export function useAIGenerations(page = 1, limit = 20, capability?: string) {
  return useQuery({
    queryKey: AI_QUERY_KEYS.generations(page, limit, capability),
    queryFn: () => aiClient.getGenerations(page, limit, capability),
    refetchInterval: (query) => {
      // Poll faster if there are pending jobs
      const hasPending = query.state.data?.jobs?.some(
        (j: any) => j.status === "QUEUED" || j.status === "PROCESSING",
      );
      return hasPending ? 3000 : 30000;
    },
  });
}

export function useAIGenerationJob(jobId?: string) {
  return useQuery({
    queryKey: AI_QUERY_KEYS.generationJob(jobId || ""),
    queryFn: () => aiClient.getGenerationJob(jobId!),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "QUEUED" || status === "PROCESSING" ? 2500 : false;
    },
  });
}

export function useGenerateText() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AITextGenerationInput & { feature?: string }) =>
      aiClient.generateText(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.credits() });
    },
  });
}

export function useGenerateImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AIImageGenerationInput) => aiClient.generateImage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.credits() });
      queryClient.invalidateQueries({ queryKey: ["ai", "generations"] });
    },
  });
}

export function useGenerateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AIVideoGenerationInput) => aiClient.generateVideo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.credits() });
      queryClient.invalidateQueries({ queryKey: ["ai", "generations"] });
    },
  });
}

export function useProductAI() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { action: "DESCRIPTION" | "SEO" | "ATTRIBUTES" | "IMAGE"; [key: string]: any }) =>
      aiClient.productAI(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.credits() });
    },
  });
}

export function useMarketplaceAI() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { action: "LISTING" | "COMPLIANCE"; [key: string]: any }) =>
      aiClient.marketplaceAI(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.credits() });
    },
  });
}

export function useBuyAICredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { packageId?: string; customCredits?: number; paymentMethod?: string; phone?: string }) =>
      aiClient.buyCredits(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.credits() });
      queryClient.invalidateQueries({ queryKey: ["ai", "transactions"] });
    },
  });
}
