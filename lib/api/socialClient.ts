/**
 * lib/api/socialClient.ts
 *
 * Frontend API client for SalesmanPro Social Media AI Platform.
 */

import {
  GenerateSocialContentInput,
  GenerateSocialContentOutput,
  GenerateCampaignInput,
  GenerateCampaignOutput,
  SocialPlatform,
  SocialPostStatus,
} from "@/lib/social/types";

export const socialClient = {
  async getAccounts(): Promise<any[]> {
    const res = await fetch("/api/social/accounts");
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch accounts");
    return data.accounts;
  },

  async disconnectAccount(id: string): Promise<void> {
    const res = await fetch(`/api/social/accounts/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to disconnect account");
  },

  async generateContent(payload: Partial<GenerateSocialContentInput>): Promise<GenerateSocialContentOutput & { post: any }> {
    const res = await fetch("/api/social/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate social content");
    return {
      ...data.strategyResult,
      post: data.post,
    };
  },

  async getPosts(options: { status?: SocialPostStatus; platform?: SocialPlatform; page?: number; limit?: number } = {}): Promise<any> {
    const params = new URLSearchParams();
    if (options.status) params.set("status", options.status);
    if (options.platform) params.set("platform", options.platform);
    if (options.page) params.set("page", options.page.toString());
    if (options.limit) params.set("limit", options.limit.toString());

    const res = await fetch(`/api/social/content?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch posts");
    return data;
  },

  async getPost(id: string): Promise<any> {
    const res = await fetch(`/api/social/content/${id}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch post");
    return data.post;
  },

  async updatePost(id: string, updateData: any): Promise<any> {
    const res = await fetch(`/api/social/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to update post");
    return data.post;
  },

  async deletePost(id: string): Promise<void> {
    const res = await fetch(`/api/social/content/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete post");
  },

  async publishNow(postId: string): Promise<any> {
    const res = await fetch("/api/social/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to publish post");
    return data;
  },

  async schedulePost(postId: string, scheduledAt: Date | string): Promise<any> {
    const res = await fetch("/api/social/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, scheduledAt }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to schedule post");
    return data;
  },

  async retryPublication(publicationId: string): Promise<any> {
    const res = await fetch(`/api/social/publish/${publicationId}/retry`, { method: "POST" });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to retry publication");
    return data;
  },

  async getCampaigns(): Promise<any[]> {
    const res = await fetch("/api/social/campaigns");
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch campaigns");
    return data.campaigns;
  },

  async createCampaign(payload: Partial<GenerateCampaignInput>): Promise<GenerateCampaignOutput> {
    const res = await fetch("/api/social/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create campaign");
    return data.campaign;
  },

  async getBrandProfile(): Promise<any> {
    const res = await fetch("/api/social/brand-profile");
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch brand profile");
    return data.profile;
  },

  async updateBrandProfile(profile: any): Promise<any> {
    const res = await fetch("/api/social/brand-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to update brand profile");
    return data.profile;
  },

  async getAnalytics(): Promise<any> {
    const res = await fetch("/api/social/analytics");
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch analytics");
    return data.analytics;
  },

  async askAdvisor(question?: string): Promise<any> {
    const res = await fetch("/api/social/advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to query advisor");
    return data.advice;
  },

  async getProducts(): Promise<any[]> {
    const res = await fetch("/api/social/products");
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch products");
    return data.products || [];
  },

  async getSuperAdminConfigs(): Promise<any[]> {
    const res = await fetch("/api/super-admin/social/config");
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch platform configs");
    return data.platforms;
  },

  async updateSuperAdminConfig(payload: any): Promise<any> {
    const res = await fetch("/api/super-admin/social/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to update platform config");
    return data.config;
  },
};
