/**
 * lib/ai/marketplaceAI.ts
 *
 * Domain AI Orchestrator for Marketplace Listings and Moderation.
 */

import { aiService } from "./aiService";
import { AIExecutionContext, AIPlatformError } from "./types";
import prisma from "@/server/db/prismadb";

export class MarketplaceAIService {
  /**
   * Generates or enhances a marketplace listing from a product or draft.
   */
  public async generateListing(
    params: {
      name: string;
      category?: string;
      sellingPrice?: number;
      condition?: string;
      description?: string;
      modelId?: string;
    },
    context: AIExecutionContext,
  ) {
    const prompt = `Create a high-performing multi-vendor marketplace listing for:
Title: "${params.name}"
Category: "${params.category || "General"}"
Price: "${params.sellingPrice || "Negotiable"}"
Condition: "${params.condition || "New"}"
Context: "${params.description || ""}"

Return strictly a JSON object with:
- "listingTitle": (string) Optimized title with brand, model, and primary feature
- "highlightSummary": (string) 2-sentence hook for mobile listing card
- "detailedDescription": (string) Complete listing description formatted with section headers
- "keyHighlights": (array of 4 strings) Bullet points covering warranty, condition, authenticity, and shipping
- "buyerFaq": (array of 3 objects with "question" and "answer") Common questions buyers ask
- "tags": (array of 6 strings) Marketplace search tags
`;

    const result = await aiService.generateText(
      {
        prompt,
        systemPrompt: "You are an expert marketplace seller and conversion specialist. Return strictly valid JSON.",
        modelId: params.modelId,
        jsonSchema: true,
      },
      {
        ...context,
        feature: "marketplace_listing_gen",
      },
    );

    return result.json || { text: result.text };
  }

  /**
   * Reviews listing content against safety, spam, and moderation standards.
   */
  public async reviewListingCompliance(
    params: {
      title: string;
      description: string;
      price: number;
      category?: string;
    },
    context: AIExecutionContext,
  ) {
    const prompt = `Review this marketplace listing for compliance, trust, and accuracy:
Title: "${params.title}"
Description: "${params.description}"
Price: "${params.price}"
Category: "${params.category || "General"}"

Return strictly a JSON object with:
- "isCompliant": (boolean) Whether the listing follows standard e-commerce safety rules
- "confidenceScore": (number from 0 to 1)
- "flags": (array of strings) Any suspicious terms, misleading claims, or forbidden items detected
- "improvementSuggestions": (array of strings) Actionable advice to boost sales and clarity
`;

    const result = await aiService.generateText(
      {
        prompt,
        systemPrompt: "You are an automated marketplace compliance and content safety moderator. Return strictly valid JSON.",
        jsonSchema: true,
      },
      {
        ...context,
        feature: "marketplace_moderation",
      },
    );

    return result.json || { isCompliant: true, confidenceScore: 0.9, flags: [], improvementSuggestions: [] };
  }
}

export const marketplaceAI = new MarketplaceAIService();
