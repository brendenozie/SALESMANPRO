"use strict";
/**
 * lib/api/aiClient.ts
 *
 * Frontend API client for SalesmanPro Central AI.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiClient = void 0;
exports.aiClient = {
    async getModels(capability) {
        const url = capability ? `/api/ai/models?capability=${capability}` : "/api/ai/models";
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok || !data.success)
            throw new Error(data.error || "Failed to fetch models");
        return data.models;
    },
    async getCredits() {
        const res = await fetch("/api/ai/credits");
        const data = await res.json();
        if (!res.ok || !data.success)
            throw new Error(data.error || "Failed to fetch credits");
        return data;
    },
    async buyCredits(params) {
        const res = await fetch("/api/ai/credits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });
        const data = await res.json();
        if (!res.ok || !data.success)
            throw new Error(data.error || "Failed to buy credits");
        return data;
    },
    async getTransactions(page = 1, limit = 20) {
        const res = await fetch(`/api/ai/credits/transactions?page=${page}&limit=${limit}`);
        const data = await res.json();
        if (!res.ok || !data.success)
            throw new Error(data.error || "Failed to fetch transactions");
        return data;
    },
    async getUsage(timeframe = "month") {
        const res = await fetch(`/api/ai/usage?timeframe=${timeframe}`);
        const data = await res.json();
        if (!res.ok || !data.success)
            throw new Error(data.error || "Failed to fetch usage analytics");
        return data;
    },
    async generateText(payload) {
        const res = await fetch("/api/ai/text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            const err = new Error(data.error || "Text generation failed");
            err.code = data.code;
            throw err;
        }
        return data.data;
    },
    async generateImage(payload) {
        const res = await fetch("/api/ai/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            const err = new Error(data.error || "Image generation failed");
            err.code = data.code;
            throw err;
        }
        return data.data;
    },
    async generateVideo(payload) {
        const res = await fetch("/api/ai/video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            const err = new Error(data.error || "Video generation failed");
            err.code = data.code;
            throw err;
        }
        return data.data;
    },
    async getGenerations(page = 1, limit = 20, capability) {
        const url = `/api/ai/generations?page=${page}&limit=${limit}${capability ? `&capability=${capability}` : ""}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok || !data.success)
            throw new Error(data.error || "Failed to fetch generations");
        return data;
    },
    async getGenerationJob(jobId) {
        const res = await fetch(`/api/ai/generations/${jobId}`);
        const data = await res.json();
        if (!res.ok || !data.success)
            throw new Error(data.error || "Failed to fetch job");
        return data.job;
    },
    async cancelGenerationJob(jobId) {
        const res = await fetch(`/api/ai/generations/${jobId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "CANCEL" }),
        });
        const data = await res.json();
        if (!res.ok || !data.success)
            throw new Error(data.error || "Failed to cancel job");
        return data;
    },
    async productAI(payload) {
        const res = await fetch("/api/ai/product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            const err = new Error(data.error || "Product AI failed");
            err.code = data.code;
            throw err;
        }
        return data.data;
    },
    async marketplaceAI(payload) {
        const res = await fetch("/api/ai/marketplace", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            const err = new Error(data.error || "Marketplace AI failed");
            err.code = data.code;
            throw err;
        }
        return data.data;
    },
    async runAgent(payload) {
        const res = await fetch("/api/ai/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            const err = new Error(data.error || "AI Agent run failed");
            err.code = data.code;
            throw err;
        }
        return data;
    },
};
