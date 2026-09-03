"use strict";
/**
 * lib/ai/productAI.ts
 *
 * Domain AI Orchestrator for Product Management.
 * Generates compelling titles, descriptions, SEO metadata, specifications,
 * attributes, and product photography / video prompts.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productAI = exports.ProductAIService = void 0;
const aiService_1 = require("./aiService");
const types_1 = require("./types");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
class ProductAIService {
    /**
     * Generates a high-converting product title and description.
     */
    async generateDescription(params, context) {
        const prompt = `Generate a compelling, high-converting eCommerce product description and summary for:
Product Name: "${params.name}"
Category: "${params.category || "General"}"
Brand: "${params.brand || "Standard"}"
Key Features: ${params.features?.join(", ") || "High quality, durable, stylish"}
Target Audience: ${params.targetAudience || "General buyers"}
Tone: ${params.tone || "compelling and professional"}

Return strictly a JSON object with:
- "title": (string) Optimized catchy product title
- "tagline": (string) Short 1-sentence hook
- "shortDescription": (string) 2-3 sentences summary for product cards
- "longDescription": (string) Full rich paragraphs detailing benefits, build, and styling
- "bulletPoints": (array of 4-6 strings) Key value propositions with emojis
- "suggestedTags": (array of 5-8 strings) Product tags
`;
        const result = await aiService_1.aiService.generateText({
            prompt,
            systemPrompt: "You are the world's best eCommerce copywriter. Always output strictly valid JSON.",
            modelId: params.modelId,
            jsonSchema: true,
        }, {
            ...context,
            feature: "product_description",
        });
        return result.json || { text: result.text };
    }
    /**
     * Generates SEO title, description, and keywords for a product.
     */
    async generateSEO(params, context) {
        const prompt = `Generate SEO meta tags for an online store product:
Product: "${params.name}"
Category: "${params.category || "General"}"
Context: "${params.currentDescription || ""}"

Return strictly a JSON object with:
- "seoTitle": (string, 50-60 characters max) High CTR title including primary keyword
- "seoDescription": (string, 140-160 characters max) Compelling meta description with call to action
- "metaKeywords": (array of 8-12 strings) High search volume keyword phrases
- "slugSuggestion": (string) Clean URL-friendly slug
`;
        const result = await aiService_1.aiService.generateText({
            prompt,
            systemPrompt: "You are an expert technical eCommerce SEO specialist. Always output strictly valid JSON.",
            modelId: params.modelId,
            jsonSchema: true,
        }, {
            ...context,
            feature: "product_seo",
        });
        return result.json || { text: result.text };
    }
    /**
     * Generates smart attributes & specifications (dimensions, colors, materials, care instructions).
     */
    async generateAttributes(params, context) {
        const prompt = `Extract and suggest standard marketplace product specifications and options for:
Product: "${params.name}"
Category: "${params.category || "General"}"

Return strictly a JSON object with:
- "suggestedColors": (array of strings, e.g. ["Midnight Black", "Space Gray", "Pearl White"])
- "suggestedSizes": (array of strings, e.g. ["S", "M", "L", "XL"] or standard dimensions)
- "material": (string or array of strings, e.g. ["Premium Cotton", "Aerospace Grade Aluminum"])
- "careInstructions": (string, e.g. "Machine wash cold with like colors, tumble dry low")
- "condition": (string, e.g. "Brand New")
- "weight": (string, estimated realistic weight)
- "warrantyPeriod": (string, e.g. "1 Year Manufacturer Warranty")
`;
        const result = await aiService_1.aiService.generateText({
            prompt,
            systemPrompt: "You are an expert eCommerce product catalog manager. Always return strictly valid JSON.",
            modelId: params.modelId,
            jsonSchema: true,
        }, {
            ...context,
            feature: "product_attributes",
        });
        return result.json || { text: result.text };
    }
    /**
     * Generates an image for a specific product and attaches it directly to the Product in DB.
     */
    async generateAndAttachImage(params, context) {
        const product = await prismadb_1.default.product.findUnique({
            where: { id: params.productId },
        });
        if (!product || product.companyId !== context.companyId) {
            throw new types_1.AIPlatformError("INVALID_REQUEST", "Product not found or unauthorized", 404);
        }
        const prompt = params.customPrompt || `Professional commercial studio photograph of ${product.name}, clean lighting, high resolution eCommerce marketplace style`;
        const result = await aiService_1.aiService.generateImage({
            prompt,
            aspectRatio: params.aspectRatio || "1:1",
            style: params.style || "vivid",
            productId: product.id,
            action: "PRODUCT_PHOTO",
        }, {
            ...context,
            feature: "product_image_gen",
        });
        if (result.images.length > 0) {
            const newImageUrl = result.images[0].url;
            const currentImages = Array.isArray(product.images) ? product.images : [];
            await prismadb_1.default.product.update({
                where: { id: product.id },
                data: {
                    images: [...currentImages, newImageUrl],
                },
            });
        }
        return result;
    }
}
exports.ProductAIService = ProductAIService;
exports.productAI = new ProductAIService();
