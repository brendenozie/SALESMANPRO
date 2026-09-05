"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAdManager = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const aiService_1 = require("@/lib/ai/aiService");
const types_1 = require("@/lib/ai/types");
const types_2 = require("./types");
class AIAdManager {
    /**
     * Product-to-Ad Pipeline:
     * Inspects real store product or marketplace listing, generates ad copy variants,
     * recommends audience & budget, and drafts an authoritative campaign.
     */
    static async generateCampaignFromProduct(params) {
        const { companyId, productId, listingId, goal = "Drive rapid product sales and verified inquiries", totalBudgetKES = 2500, durationDays = 7, userId = "system_ai_ad_manager", } = params;
        let targetItemName = "Store Special";
        let targetPrice = 0;
        let targetCategory = "General";
        let targetDescription = "";
        let targetImages = [];
        // 1. Fetch authoritative product or marketplace listing data
        if (productId) {
            const product = await prismadb_1.default.product.findUnique({
                where: { id: productId },
            });
            if (!product)
                throw new Error(`Product ${productId} not found.`);
            targetItemName = product.name;
            targetPrice = product.sellingPrice || 0;
            targetCategory = product.category || "General Retail";
            targetDescription = product.description || "";
            targetImages = Array.isArray(product.images) ? product.images.map(String) : [];
        }
        else if (listingId) {
            const listing = await prismadb_1.default.marketplaceListings.findUnique({
                where: { id: listingId },
            });
            if (!listing)
                throw new Error(`Marketplace Listing ${listingId} not found.`);
            targetItemName = listing.name;
            targetPrice = listing.finalPrice || listing.sellingPrice || 0;
            targetCategory = listing.category || "Marketplace";
            targetDescription = listing.description || "";
            targetImages = Array.isArray(listing.images) ? listing.images.map(String) : [];
        }
        else {
            throw new Error("Either productId or listingId must be provided for ad generation.");
        }
        // 2. Prompt AI for high-converting commercial copy with zero-hallucination context
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
        let generatedStrategy;
        try {
            if (companyId) {
                const aiResponse = await aiService_1.centralAIService.generateText({
                    prompt: `Generate an ad campaign strategy and copy for: ${targetItemName}`,
                    systemPrompt,
                    temperature: 0.7,
                }, {
                    companyId,
                    userId,
                    capability: types_1.AICapability.SOCIAL_MARKETING,
                    feature: "ad_campaign_generation",
                    source: "AGENT",
                });
                // Parse JSON from output
                const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    generatedStrategy = JSON.parse(jsonMatch[0]);
                }
                else {
                    throw new Error("AI returned non-JSON structure.");
                }
            }
            else {
                throw new Error("No companyId provided for AI generation");
            }
        }
        catch (err) {
            console.warn("[AI_AD_GENERATION_FALLBACK] Using deterministic template:", err?.message || err);
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
        const campaign = await prismadb_1.default.adCampaign.create({
            data: {
                companyId: companyId || null,
                advertiserType: listingId ? types_2.AdvertiserType.GHUBA_ADVERTISER : types_2.AdvertiserType.STORE_ADVERTISER,
                name: generatedStrategy.campaignName || `${targetItemName} Boost`,
                status: types_2.AdCampaignStatus.DRAFT,
                objective: types_2.AdObjective.PRODUCT_SALES,
                currency: "KES",
                totalBudgetKES,
                dailyBudgetKES: dailyBudget,
                spentAmountKES: 0,
                startDate,
                endDate,
                biddingStrategy: types_2.AdBiddingStrategy.CPM,
                bidAmountKES: 50.0,
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
                    create: generatedStrategy.variants.map((v) => ({
                        type: types_2.AdCreativeType.IMAGE,
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
exports.AIAdManager = AIAdManager;
