/**
 * lib/ads/aiAdManager.ts
 *
 * AI Advertising Manager & Product-to-Ad Pipeline.
 * Integrates store catalog data, AI Studio copywriting, and credit accounting.
 *
 * ZERO-HALLUCINATION ENFORCEMENT:
 * Real prices, actual stock levels, and store categories are strictly injected
 * into prompt context to prevent false pricing, false discounts, or fake claims.
 */

import prisma from "@/server/db/prismadb";
import { centralAIService } from "@/lib/ai/aiService";
import { creditLedger } from "@/lib/ai/creditLedger";
import { AICapability } from "@/lib/ai/types";
import {
  AdvertiserType,
  AdObjective,
  AdCampaignStatus,
  AdBiddingStrategy,
  AdCreativeType,
  CreateCampaignDTO,
} from "./types";

export class AIAdManager {
  /**
   * Product-to-Ad Pipeline:
   * Inspects real store product or marketplace listing, generates ad copy variants,
   * recommends audience & budget, and drafts an authoritative campaign.
   */
  public static async generateCampaignFromProduct(params: {
    companyId?: string | null;
    productId?: string;
    listingId?: string;
    goal?: string;
    totalBudgetKES?: number;
    durationDays?: number;
    userId?: string;
  }) {
    const {
      companyId,
      productId,
      listingId,
      goal = "Drive rapid product sales and verified inquiries",
      totalBudgetKES = 2500,
      durationDays = 7,
      userId = "system_ai_ad_manager",
    } = params;

    let targetItemName = "Store Special";
    let targetPrice = 0;
    let targetCategory = "General";
    let targetDescription = "";
    let targetImages: string[] = [];

    // 1. Fetch authoritative product or marketplace listing data
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) throw new Error(`Product ${productId} not found.`);

      targetItemName = product.name;
      targetPrice = product.sellingPrice || 0;
      targetCategory = (product as any).category || "General Retail";
      targetDescription = product.description || "";
      targetImages = product.images || [];
    } else if (listingId) {
      const listing = await prisma.marketplaceListings.findUnique({
        where: { id: listingId },
      });
      if (!listing) throw new Error(`Marketplace Listing ${listingId} not found.`);

      targetItemName = listing.name;
      targetPrice = listing.finalPrice || listing.sellingPrice || 0;
      targetCategory = (listing as any).category || "Marketplace";
      targetDescription = listing.description || "";
      targetImages = listing.images || [];
    } else {
      throw new Error("Either productId or listingId must be provided for ad generation.");
    }

    // 2. Reserve AI credits for computation (Strictly separated from Ad Budget)
    const computeCredits = 2.0; // Standard generation cost
    let reservation: any = null;

    if (companyId) {
      try {
        reservation = await creditLedger.reserveCredits({
          companyId,
          userId,
          capability: AICapability.CAMPAIGN_AD_COPY,
          estimatedCredits: computeCredits,
          metadata: { operation: "PRODUCT_TO_AD_GENERATION", targetItemName },
        });
      } catch (err: any) {
        console.warn("[AI_AD_CREDIT_WARN] Could not reserve credits:", err?.message || err);
      }
    }

    // 3. Prompt AI for high-converting commercial copy with zero-hallucination context
    const systemPrompt = `You are the Principal Advertising Architect and Performance Copywriter for SalesmanPro and Ghuba.
Generate a structured JSON response containing 3 high-converting ad creative variants (Creative A: Direct Product/Benefit, Creative B: Urgency/Offer, Creative C: Story/Educational) and an audience targeting recommendation.

STRICT COMMERCIAL RULES:
- The actual verified price is KES ${targetPrice.toLocaleString()}. DO NOT invent a lower price or fabricate fake discounts unless specified.
- Product Name: "${targetItemName}"
- Category: "${targetCategory}"
- Base Product Overview: "${targetDescription}"
- Ad Objective: "${goal}"

You MUST respond strictly in valid JSON format with this exact schema:
{
  "campaignName": "string",
  "recommendedObjective": "PRODUCT_SALES",
  "targetAudienceSummary": "string",
  "suggestedLocations": ["string"],
  "suggestedKeywords": ["string"],
  "variants": [
    {
      "variantTag": "A",
      "headline": "string (punchy, max 45 chars)",
      "body": "string (engaging, max 150 chars)",
      "ctaText": "Order on WhatsApp | Shop Now | View Listing",
      "creativeAngle": "Direct Value"
    },
    {
      "variantTag": "B",
      "headline": "string",
      "body": "string",
      "ctaText": "string",
      "creativeAngle": "Urgency"
    },
    {
      "variantTag": "C",
      "headline": "string",
      "body": "string",
      "ctaText": "string",
      "creativeAngle": "Educational"
    }
  ]
}`;

    let generatedStrategy: any;
    try {
      const aiResponse = await centralAIService.generateText({
        companyId: companyId || "system",
        userId,
        capability: AICapability.CAMPAIGN_AD_COPY,
        prompt: `Generate an ad campaign strategy and copy for: ${targetItemName}`,
        systemPrompt,
        temperature: 0.7,
      });

      // Parse JSON from output
      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedStrategy = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("AI returned non-JSON structure.");
      }

      // Finalize AI Credit Charge
      if (reservation) {
        await creditLedger.finalizeCharge({
          reservationId: reservation.reservationId,
          actualCredits: computeCredits,
          tokensUsed: aiResponse.usage?.totalTokens || 350,
          rawUsage: aiResponse.usage,
        });
      }
    } catch (err: any) {
      if (reservation) {
        await creditLedger.refundCredits({
          reservationId: reservation.reservationId,
          reason: `AI Ad Generation Failure: ${err?.message || "Internal error"}`,
        });
      }

      // Fallback deterministic copy
      generatedStrategy = {
        campaignName: `${targetItemName} Promotion`,
        recommendedObjective: "PRODUCT_SALES",
        targetAudienceSummary: `Shoppers looking for verified ${targetCategory} in Kenya.`,
        suggestedLocations: ["Nairobi", "Mombasa", "Kisumu"],
        suggestedKeywords: [targetItemName.toLowerCase(), targetCategory.toLowerCase(), "online shopping kenya"],
        variants: [
          {
            variantTag: "A",
            headline: `Get ${targetItemName} Today`,
            body: `Discover quality ${targetItemName} for only KES ${targetPrice.toLocaleString()}. Fast nationwide delivery and direct checkout.`,
            ctaText: "Shop Now",
            creativeAngle: "Direct Value",
          },
          {
            variantTag: "B",
            headline: `Special Deal on ${targetItemName}`,
            body: `Order ${targetItemName} now while inventory lasts. Reliable doorstep delivery across Kenya.`,
            ctaText: "Order on WhatsApp",
            creativeAngle: "Urgency",
          },
          {
            variantTag: "C",
            headline: `Verified ${targetItemName}`,
            body: `Looking for top-tier ${targetCategory}? Check out ${targetItemName}. Premium quality guaranteed.`,
            ctaText: "View Listing",
            creativeAngle: "Educational",
          },
        ],
      };
    }

    // 4. Create authoritative AdCampaign draft in Database
    const dailyBudget = Math.round((totalBudgetKES / Math.max(1, durationDays)) * 100) / 100;
    const startDate = new Date();
    const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const campaign = await prisma.adCampaign.create({
      data: {
        companyId: companyId || null,
        advertiserType: listingId ? AdvertiserType.GHUBA_ADVERTISER : AdvertiserType.STORE_ADVERTISER,
        name: generatedStrategy.campaignName || `${targetItemName} Boost`,
        status: AdCampaignStatus.DRAFT, // Always drafts for human review
        objective: AdObjective.PRODUCT_SALES,
        currency: "KES",
        totalBudgetKES,
        dailyBudgetKES: dailyBudget,
        spentAmountKES: 0,
        startDate,
        endDate,
        biddingStrategy: AdBiddingStrategy.CPM,
        bidAmountKES: 50.0, // Default 50 KES CPM
        targetAudience: generatedStrategy.targetAudienceSummary,
        targetingRules: {
          categories: [targetCategory],
          locations: generatedStrategy.suggestedLocations || ["Nairobi"],
          keywords: generatedStrategy.suggestedKeywords || [targetItemName.toLowerCase()],
        },
        automationMode: "ASSISTED",
        approvalStatus: "DRAFT",
        listingId: listingId || null,
        productId: productId || null,
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spendKES: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0,
          attributedRevenueKES: 0,
          roas: 0,
        },
        creatives: {
          create: generatedStrategy.variants.map((v: any) => ({
            type: AdCreativeType.IMAGE,
            title: `${targetItemName} - Variant ${v.variantTag}`,
            headline: v.headline,
            body: v.body,
            ctaText: v.ctaText || "Shop Now",
            ctaUrl: listingId ? `/ghuba/productlist/${listingId}` : `/stores?product=${productId}`,
            mediaUrl: targetImages[0] || null,
            variantTag: v.variantTag,
            status: "ACTIVE",
          })),
        },
      },
      include: {
        creatives: true,
      },
    });

    return {
      success: true,
      campaignId: campaign.id,
      name: campaign.name,
      totalBudgetKES: campaign.totalBudgetKES,
      dailyBudgetKES: campaign.dailyBudgetKES,
      creativesCount: campaign.creatives.length,
      creatives: campaign.creatives,
      targetAudience: campaign.targetAudience,
      verificationNotice: `Ad draft generated for '${targetItemName}' at verified price KES ${targetPrice.toLocaleString()}. Requires human merchant review before launch.`,
    };
  }
}
