/**
 * lib/api/aiClient.ts
 *
 * Frontend API client for SalesmanPro Central AI.
 */

import {
  AIModelMetadata,
  AICreditBalanceResponse,
  AICreditTransactionDTO,
  AITextGenerationInput,
  AITextGenerationOutput,
  AIImageGenerationInput,
  AIImageGenerationOutput,
  AIVideoGenerationInput,
  AIVideoGenerationOutput,
} from "@/lib/ai/types";

export interface AIClientResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  [key: string]: any;
}

export const aiClient = {
  async getModels(capability?: string): Promise<AIModelMetadata[]> {
    const url = capability ? `/api/ai/models?capability=${capability}` : "/api/ai/models";
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch models");
    return data.models;
  },

  async getCredits(): Promise<AICreditBalanceResponse & { companyName?: string }> {
    const res = await fetch("/api/ai/credits");
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch credits");
    return data;
  },

  async buyCredits(params: {
    packageId?: string;
    customCredits?: number;
    paymentMethod?: string;
    phone?: string;
  }): Promise<{ newBalance: number; message: string }> {
    const res = await fetch("/api/ai/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to buy credits");
    return data;
  },

  async getTransactions(page = 1, limit = 20): Promise<{
    transactions: AICreditTransactionDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const res = await fetch(`/api/ai/credits/transactions?page=${page}&limit=${limit}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch transactions");
    return data;
  },

  async getUsage(timeframe = "month"): Promise<any> {
    const res = await fetch(`/api/ai/usage?timeframe=${timeframe}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch usage analytics");
    return data;
  },

  async generateText(payload: AITextGenerationInput & { feature?: string }): Promise<AITextGenerationOutput> {
    const res = await fetch("/api/ai/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      const err = new Error(data.error || "Text generation failed");
      (err as any).code = data.code;
      throw err;
    }
    return data.data;
  },

  async generateImage(payload: AIImageGenerationInput): Promise<AIImageGenerationOutput> {
    const res = await fetch("/api/ai/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      const err = new Error(data.error || "Image generation failed");
      (err as any).code = data.code;
      throw err;
    }
    return data.data;
  },

  async generateVideo(payload: AIVideoGenerationInput): Promise<AIVideoGenerationOutput> {
    const res = await fetch("/api/ai/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      const err = new Error(data.error || "Video generation failed");
      (err as any).code = data.code;
      throw err;
    }
    return data.data;
  },

  async getGenerations(page = 1, limit = 20, capability?: string): Promise<any> {
    const url = `/api/ai/generations?page=${page}&limit=${limit}${capability ? `&capability=${capability}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch generations");
    return data;
  },

  async getGenerationJob(jobId: string): Promise<any> {
    const res = await fetch(`/api/ai/generations/${jobId}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch job");
    return data.job;
  },

  async cancelGenerationJob(jobId: string): Promise<any> {
    const res = await fetch(`/api/ai/generations/${jobId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CANCEL" }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to cancel job");
    return data;
  },

  async productAI(payload: { action: "DESCRIPTION" | "SEO" | "ATTRIBUTES" | "IMAGE"; [key: string]: any }): Promise<any> {
    const res = await fetch("/api/ai/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      const err = new Error(data.error || "Product AI failed");
      (err as any).code = data.code;
      throw err;
    }
    return data.data;
  },

  async marketplaceAI(payload: { action: "LISTING" | "COMPLIANCE"; [key: string]: any }): Promise<any> {
    const res = await fetch("/api/ai/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      const err = new Error(data.error || "Marketplace AI failed");
      (err as any).code = data.code;
      throw err;
    }
    return data.data;
  },

  async runAgent(payload: {
    prompt: string;
    agentRole?: "SALES_ASSISTANT" | "SUPPORT_REP" | "MARKETING_ADVISOR" | "BUSINESS_ANALYST";
    conversationHistory?: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    modelId?: string;
  }): Promise<{ reply: string; model: string; creditsConsumed: number }> {
    const res = await fetch("/api/ai/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      const err = new Error(data.error || "AI Agent run failed");
      (err as any).code = data.code;
      throw err;
    }
    return data;
  },
};
