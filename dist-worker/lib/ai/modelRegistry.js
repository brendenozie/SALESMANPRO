"use strict";
/**
 * lib/ai/modelRegistry.ts
 *
 * Authoritative Model Registry for SalesmanPro Central AI Platform.
 * Dictates available models, provider mappings, token credit costs, and capabilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelRegistry = exports.ModelRegistry = exports.MODEL_CATALOG = void 0;
exports.MODEL_CATALOG = [
    // --- TEXT & MULTIMODAL MODELS ---
    {
        id: "gpt-4o-mini",
        provider: "OPENAI",
        capability: "TEXT",
        displayName: "GPT-4o Mini (Default Fast)",
        description: "Fast, intelligent, and cost-effective text generation for product copy, SEO, and marketing.",
        enabled: true,
        isDefault: true,
        inputCreditCost: 1,
        outputCreditCost: 2,
        minimumCredits: 2,
        maxTokens: 4096,
        contextWindow: 128000,
        supportsVision: true,
        supportsStreaming: true,
        supportsJsonSchema: true,
    },
    {
        id: "gpt-4o",
        provider: "OPENAI",
        capability: "TEXT",
        displayName: "GPT-4o Flagship",
        description: "High-reasoning flagship model for complex business strategy, sales negotiation, and high-fidelity copy.",
        enabled: true,
        isDefault: false,
        inputCreditCost: 5,
        outputCreditCost: 15,
        minimumCredits: 10,
        maxTokens: 4096,
        contextWindow: 128000,
        supportsVision: true,
        supportsStreaming: true,
        supportsJsonSchema: true,
    },
    {
        id: "llama-3.3-70b-versatile",
        provider: "GROQ",
        capability: "TEXT",
        displayName: "Llama 3.3 70B (Ultra-Fast)",
        description: "Ultra-low-latency structured commerce engine powered by Groq LPU inference.",
        enabled: true,
        isDefault: false,
        inputCreditCost: 1,
        outputCreditCost: 2,
        minimumCredits: 2,
        maxTokens: 4096,
        contextWindow: 128000,
        supportsVision: false,
        supportsStreaming: true,
        supportsJsonSchema: true,
    },
    {
        id: "gemini-2.0-flash",
        provider: "GEMINI",
        capability: "TEXT",
        displayName: "Gemini 2.0 Flash",
        description: "Google's ultra-fast multimodal model for visual analysis, speed, and real-time generation.",
        enabled: true,
        isDefault: false,
        inputCreditCost: 1,
        outputCreditCost: 2,
        minimumCredits: 2,
        maxTokens: 8192,
        contextWindow: 1000000,
        supportsVision: true,
        supportsStreaming: true,
        supportsJsonSchema: true,
    },
    {
        id: "gemini-1.5-pro",
        provider: "GEMINI",
        capability: "TEXT",
        displayName: "Gemini 1.5 Pro",
        description: "Massive context reasoning for comprehensive catalog indexing, long documents, and multi-asset campaigns.",
        enabled: true,
        isDefault: false,
        inputCreditCost: 4,
        outputCreditCost: 12,
        minimumCredits: 8,
        maxTokens: 8192,
        contextWindow: 2000000,
        supportsVision: true,
        supportsStreaming: true,
        supportsJsonSchema: true,
    },
    // --- IMAGE GENERATION & EDITING MODELS ---
    {
        id: "dall-e-3",
        provider: "OPENAI",
        capability: "IMAGE",
        displayName: "DALL-E 3 (Photorealistic)",
        description: "State-of-the-art image generation for marketplace products, hero banners, and promotional artwork.",
        enabled: true,
        isDefault: true,
        inputCreditCost: 0,
        outputCreditCost: 0,
        imageCreditCost: 20,
        minimumCredits: 20,
        supportsVision: false,
    },
    {
        id: "dall-e-2",
        provider: "OPENAI",
        capability: "IMAGE",
        displayName: "DALL-E 2 (Fast Square)",
        description: "Fast generation for thumbnails and small promotional graphics.",
        enabled: true,
        isDefault: false,
        inputCreditCost: 0,
        outputCreditCost: 0,
        imageCreditCost: 10,
        minimumCredits: 10,
    },
    {
        id: "product-photo-enhancer",
        provider: "DALL_E",
        capability: "IMAGE",
        displayName: "Product Photo Studio AI",
        description: "Professional background isolation, lighting enhancement, and clean white/studio marketplace backdrop.",
        enabled: true,
        isDefault: false,
        inputCreditCost: 0,
        outputCreditCost: 0,
        imageCreditCost: 15,
        minimumCredits: 15,
    },
    // --- VIDEO GENERATION MODELS ---
    {
        id: "salesman-video-v1",
        provider: "OPENAI",
        capability: "VIDEO",
        displayName: "SalesmanPro AI Video Studio",
        description: "Automated promotional videos, product showcase reels, and animated marketplace ads.",
        enabled: true,
        isDefault: true,
        inputCreditCost: 0,
        outputCreditCost: 0,
        videoCreditCost: 50,
        minimumCredits: 50,
    },
    {
        id: "product-to-video-animator",
        provider: "OPENAI",
        capability: "VIDEO",
        displayName: "Product-to-Video Reel Creator",
        description: "Converts product images, features, and pricing into an engaging social video.",
        enabled: true,
        isDefault: false,
        inputCreditCost: 0,
        outputCreditCost: 0,
        videoCreditCost: 40,
        minimumCredits: 40,
    },
];
class ModelRegistry {
    catalog = new Map();
    constructor(models = exports.MODEL_CATALOG) {
        for (const model of models) {
            this.catalog.set(model.id, model);
        }
    }
    getModel(modelId) {
        if (modelId && this.catalog.has(modelId)) {
            const model = this.catalog.get(modelId);
            if (model.enabled)
                return model;
        }
        // Default fallback to first enabled text model
        const fallback = Array.from(this.catalog.values()).find((m) => m.capability === "TEXT" && m.enabled && m.isDefault) || Array.from(this.catalog.values()).find((m) => m.enabled);
        return fallback;
    }
    getDefaultModel(capability) {
        const defaultModel = Array.from(this.catalog.values()).find((m) => m.capability === capability && m.enabled && m.isDefault);
        if (defaultModel)
            return defaultModel;
        const anyEnabled = Array.from(this.catalog.values()).find((m) => m.capability === capability && m.enabled);
        if (anyEnabled)
            return anyEnabled;
        return this.getModel();
    }
    getAllEnabledModels() {
        return Array.from(this.catalog.values()).filter((m) => m.enabled);
    }
    getModelsByCapability(capability) {
        return Array.from(this.catalog.values()).filter((m) => m.capability === capability && m.enabled);
    }
    calculateEstimatedCreditCost(model, params = {}) {
        if (model.capability === "IMAGE") {
            let costPerImage = model.imageCreditCost ?? 20;
            if (params.quality === "hd") {
                costPerImage = Math.round(costPerImage * 1.5);
            }
            return (params.imageCount ?? 1) * costPerImage;
        }
        if (model.capability === "VIDEO") {
            const baseCost = model.videoCreditCost ?? 50;
            const duration = params.videoDurationSeconds ?? 5;
            return Math.max(model.minimumCredits, Math.ceil((baseCost * duration) / 5));
        }
        // Text token calculation
        const inputTokens = params.estimatedPromptTokens ?? 500;
        const outputTokens = params.estimatedCompletionTokens ?? 500;
        const inputCost = (inputTokens / 1000) * model.inputCreditCost;
        const outputCost = (outputTokens / 1000) * model.outputCreditCost;
        const total = Math.ceil(inputCost + outputCost);
        return Math.max(model.minimumCredits, total);
    }
    calculateActualCreditCost(model, params) {
        return this.calculateEstimatedCreditCost(model, {
            estimatedPromptTokens: params.promptTokens,
            estimatedCompletionTokens: params.completionTokens,
            imageCount: params.imageCount,
            videoDurationSeconds: params.videoDurationSeconds,
            quality: params.quality,
        });
    }
}
exports.ModelRegistry = ModelRegistry;
exports.modelRegistry = new ModelRegistry();
