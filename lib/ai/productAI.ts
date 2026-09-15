/**
 * lib/ai/productAI.ts
 *
 * Domain AI Orchestrator for Product Management.
 * Generates compelling titles, descriptions, SEO metadata, specifications,
 * attributes, and product photography / video prompts.
 */

import { Prisma } from "@prisma/client";
import { aiService } from "./aiService";
import { AIExecutionContext, AIPlatformError } from "./types";
import prisma from "@/server/db/prismadb";
import { syncProductToMarketplaceListings } from "@/lib/marketplace/syncProductToListing";

export class ProductAIService {
  /**
   * Generates a high-converting product title and description.
   */
  public async generateDescription(
    params: {
      name: string;
      category?: string;
      brand?: string;
      features?: string[];
      targetAudience?: string;
      tone?: "compelling" | "luxurious" | "technical" | "playful" | "professional";
      modelId?: string;
    },
    context: AIExecutionContext,
  ) {
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

    const result = await aiService.generateText(
      {
        prompt,
        systemPrompt: "You are the world's best eCommerce copywriter. Always output strictly valid JSON.",
        modelId: params.modelId,
        jsonSchema: true,
      },
      {
        ...context,
        feature: "product_description",
      },
    );

    return result.json || { text: result.text };
  }

  /**
   * Generates SEO title, description, and keywords for a product.
   */
  public async generateSEO(
    params: {
      name: string;
      category?: string;
      currentDescription?: string;
      modelId?: string;
    },
    context: AIExecutionContext,
  ) {
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

    const result = await aiService.generateText(
      {
        prompt,
        systemPrompt: "You are an expert technical eCommerce SEO specialist. Always output strictly valid JSON.",
        modelId: params.modelId,
        jsonSchema: true,
      },
      {
        ...context,
        feature: "product_seo",
      },
    );

    return result.json || { text: result.text };
  }

  /**
   * Generates comprehensive SEO strategy (title, description, keywords, strategy) for a Store.
   */
  public async generateStoreSEO(
    params: {
      storeName: string;
      category?: string;
      tagline?: string;
      description?: string;
      topProducts?: string[];
      city?: string;
      country?: string;
      modelId?: string;
    },
    context: AIExecutionContext,
  ) {
    const prompt = `You are the world's leading technical eCommerce SEO strategist.
Generate an optimized, high-CTR search engine profile for this online business:
Store Name: "${params.storeName}"
Category / Vertical: "${params.category || "General Store"}"
Tagline: "${params.tagline || ""}"
Current Bio: "${params.description || ""}"
Key Offerings / Top Products: ${params.topProducts?.join(", ") || "Diverse catalog"}
Location: ${[params.city, params.country].filter(Boolean).join(", ") || "Global"}

Requirements:
1. "seoTitle": (50-65 characters) Highly clickable, includes primary commercial keyword, location (if available), and store name. No keyword stuffing.
2. "seoDescription": (145-160 characters) Compelling meta snippet answering search intent, showcasing uniqueness, and ending with an active call to action.
3. "keywords": (array of 10-15 targeted phrases) High-intent transactional, commercial, and localized long-tail keywords.
4. "competitiveSummary": (1-2 sentences) Brief strategy rationale explaining why this metadata will outrank competitors.

Return strictly a JSON object with keys: "seoTitle", "seoDescription", "keywords", "competitiveSummary".`;

    try {
      const result = await aiService.generateText(
        {
          prompt,
          systemPrompt: "You are an expert technical eCommerce SEO specialist. Always output strictly valid JSON.",
          modelId: params.modelId,
          jsonSchema: true,
        },
        {
          ...context,
          feature: "store_seo",
        },
      );

      if (result.json && (result.json.seoTitle || result.json.title)) {
        return {
          seoTitle: (result.json.seoTitle || result.json.title) as string,
          seoDescription: (result.json.seoDescription || result.json.description) as string,
          keywords: (result.json.keywords || result.json.metaKeywords || []) as string[],
          competitiveSummary: (result.json.competitiveSummary || "AI-optimized based on store catalog and regional search intent.") as string,
        };
      }
    } catch (err: any) {
      console.warn("AI generation encountered issue, falling back to deterministic SEO generator:", err?.message);
    }

    // Deterministic High-Quality Fallback if AI provider is unconfigured or rate-limited
    const locPart = params.city ? ` in ${params.city}` : "";
    const catPart = params.category ? ` | ${params.category}` : "";
    const cleanTitle = `${params.storeName} - Best Online Deals${locPart}${catPart}`.slice(0, 65);
    const cleanDesc = `Shop authentic products online at ${params.storeName}. Enjoy fast delivery, verified customer service, and unbeatable prices${locPart}. Explore our catalog today!`.slice(0, 160);
    const fallbackKeywords = [
      params.storeName.toLowerCase(),
      `${params.storeName.toLowerCase()} online shop`,
      `buy online ${params.city || "kenya"}`.toLowerCase(),
      params.category ? `${params.category.toLowerCase()} online` : "ecommerce store",
      "best prices online",
      "fast delivery shopping",
    ];

    return {
      seoTitle: cleanTitle,
      seoDescription: cleanDesc,
      keywords: fallbackKeywords,
      competitiveSummary: "Generated using deterministic high-conversion eCommerce SEO templates.",
    };
  }

  /**
   * Generates smart attributes & specifications (dimensions, colors, materials, care instructions).
   */
  public async generateAttributes(
    params: {
      name: string;
      category?: string;
      modelId?: string;
    },
    context: AIExecutionContext,
  ) {
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

    const result = await aiService.generateText(
      {
        prompt,
        systemPrompt: "You are an expert eCommerce product catalog manager. Always return strictly valid JSON.",
        modelId: params.modelId,
        jsonSchema: true,
      },
      {
        ...context,
        feature: "product_attributes",
      },
    );

    return result.json || { text: result.text };
  }

  /**
   * Generates an image for a specific product and attaches it directly to the Product in DB.
   */
  public async generateAndAttachImage(
    params: {
      productId: string;
      customPrompt?: string;
      style?: "vivid" | "natural";
      aspectRatio?: "1:1" | "16:9" | "4:3";
      targetType?: "PRODUCT" | "LISTING" | "BOTH";
      listingId?: string;
    },
    context: AIExecutionContext,
  ) {
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
    });

    if (!product || product.companyId !== context.companyId) {
      throw new AIPlatformError("INVALID_REQUEST", "Product not found or unauthorized", 404);
    }

    const prompt = params.customPrompt || `Professional commercial studio photograph of ${product.name}, clean lighting, high resolution eCommerce marketplace style`;

    const result = await aiService.generateImage(
      {
        prompt,
        aspectRatio: params.aspectRatio || "1:1",
        style: params.style || "vivid",
        productId: product.id,
        action: "PRODUCT_PHOTO",
      },
      {
        ...context,
        feature: "product_image_gen",
      },
    );

    if (result.images.length > 0) {
      const newImageUrl = result.images[0].url;
      const targetType = params.targetType || "PRODUCT";

      // If targeted to Product or Both, attach to Product record
      if (targetType === "PRODUCT" || targetType === "BOTH") {
        const currentImages = (
          Array.isArray(product.images) ? (product.images as Prisma.InputJsonValue[]) : []
        ).filter((img): img is Prisma.InputJsonValue => img !== null);

        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: [...currentImages, newImageUrl],
          },
        });
      }

      // If explicitly targeted to Listing or Both, attach to consumer-facing listing(s)
      if (targetType === "LISTING" || targetType === "BOTH") {
        const attachedListings = params.listingId
          ? await prisma.marketplaceListings.findMany({ where: { id: params.listingId } })
          : await prisma.marketplaceListings.findMany({ where: { productId: product.id } });

        for (const listing of attachedListings) {
          const listingImages = (
            Array.isArray(listing.images) ? (listing.images as Prisma.InputJsonValue[]) : []
          ).filter((img): img is Prisma.InputJsonValue => img !== null);

          await prisma.marketplaceListings.update({
            where: { id: listing.id },
            data: {
              images: [...listingImages, newImageUrl],
            },
          });
        }
      }
    }

    return result;
  }

  /**
   * Applies AI-generated titles, descriptions, tags, and specifications
   * to the targeted entity (PRODUCT, LISTING, or BOTH).
   */
  public async applyProductAI(
    params: {
      productId?: string;
      listingId?: string;
      targetType?: "PRODUCT" | "LISTING" | "BOTH";
      name?: string;
      description?: string;
      longDescription?: string;
      tags?: string[];
      bulletPoints?: string[];
      attributes?: Record<string, any>;
    },
    context: AIExecutionContext,
  ) {
    let resolvedProductId = params.productId;

    if (!resolvedProductId && params.listingId) {
      const listing = await prisma.marketplaceListings.findUnique({
        where: { id: params.listingId },
        select: { id: true, productId: true },
      });
      if (listing?.productId) {
        resolvedProductId = listing.productId;
      }
    }

    // Default target: if only listingId passed, target is LISTING; if targetType passed, use it; else if productId passed, default to PRODUCT
    const targetType = params.targetType || (params.listingId && !params.productId ? "LISTING" : "PRODUCT");

    const updateData: Record<string, any> = {};
    if (params.name) updateData.name = params.name.trim();
    if (params.description) updateData.description = params.description.trim();

    let fullDescription = params.longDescription || params.description;
    if (params.bulletPoints && params.bulletPoints.length > 0) {
      const bullets = "\n\nKey Highlights:\n" + params.bulletPoints.join("\n");
      fullDescription = fullDescription ? `${fullDescription}${bullets}` : bullets;
    }
    if (fullDescription) updateData.longDescription = fullDescription.trim();
    if (params.tags && Array.isArray(params.tags)) updateData.tags = params.tags;

    if (params.attributes) {
      if (params.attributes.material) updateData.material = Array.isArray(params.attributes.material) ? params.attributes.material : [params.attributes.material];
      if (params.attributes.careInstructions) updateData.careInstructions = params.attributes.careInstructions;
      if (params.attributes.warrantyPeriod) updateData.warrantyPeriod = params.attributes.warrantyPeriod;
      if (params.attributes.condition) updateData.condition = params.attributes.condition;
      if (params.attributes.weight) updateData.weight = Array.isArray(params.attributes.weight) ? params.attributes.weight : [params.attributes.weight];
    }

    let updatedProduct: any = null;
    let updatedListing: any = null;

    // Apply to Product if target is PRODUCT or BOTH
    if ((targetType === "PRODUCT" || targetType === "BOTH") && resolvedProductId) {
      updatedProduct = await prisma.product.update({
        where: { id: resolvedProductId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });
    }

    // Apply to Listing if target is LISTING or BOTH
    if (targetType === "LISTING" || targetType === "BOTH") {
      if (params.listingId) {
        updatedListing = await prisma.marketplaceListings.update({
          where: { id: params.listingId },
          data: {
            ...updateData,
            updatedAt: new Date(),
          },
        });
      } else if (resolvedProductId) {
        await prisma.marketplaceListings.updateMany({
          where: { productId: resolvedProductId },
          data: {
            ...updateData,
            updatedAt: new Date(),
          },
        });
      }
    }

    return {
      success: true,
      product: updatedProduct,
      listing: updatedListing,
      targetType,
      updatedFields: Object.keys(updateData),
    };
  }
}

export const productAI = new ProductAIService();
