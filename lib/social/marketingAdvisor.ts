/**
 * lib/social/marketingAdvisor.ts
 *
 * SalesmanPro AI Marketing Advisor.
 * Analyzes store performance, product catalog, and past post analytics to provide
 * actionable, data-backed marketing advice and content recommendations without hallucinating.
 */

import prisma from "@/server/db/prismadb";
import { centralAIService } from "@/lib/ai/aiService";
import { AIPlatformError } from "@/lib/ai/types";

export interface AdvisorRecommendation {
  answer: string;
  recommendedActions: Array<{
    type: "CREATE_POST" | "LAUNCH_CAMPAIGN" | "REPURPOSE_CONTENT" | "SCHEDULE_BEST_TIME";
    title: string;
    description: string;
    suggestedProductId?: string;
    suggestedPlatform?: string;
  }>;
  suggestedProductsToPromote: Array<{
    id: string;
    name: string;
    category?: string | null;
    reason: string;
  }>;
  topPerformingPlatform?: string;
}

export class MarketingAdvisor {
  /**
   * Evaluates store data and returns tailored strategic marketing advice.
   */
  public async getAdvice(params: {
    companyId: string;
    question?: string;
  }): Promise<AdvisorRecommendation> {
    const { companyId, question } = params;

    // 1. Fetch Store Profile & Category
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        companyCategory: true,
        socialBrandProfile: true,
        socialAccounts: { where: { status: "CONNECTED" } },
      },
    });

    if (!company) {
      throw new AIPlatformError("TENANT_NOT_FOUND", "Store company not found", 404);
    }

    // 2. Fetch Recent Social Posts & Publications (Last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentPosts = await prisma.socialMediaPost.findMany({
      where: {
        companyId,
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        publications: true,
        product: { select: { id: true, name: true, category: true } },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    // 3. Find Products that haven't been promoted recently
    const promotedProductIds = new Set(recentPosts.map((p) => p.productId).filter(Boolean));
    const unpromotedProducts = await prisma.product.findMany({
      where: {
        companyId,
        id: { notIn: Array.from(promotedProductIds) as string[] },
      },
      take: 5,
      select: { id: true, name: true, category: true, description: true },
    });

    // 4. Calculate Top Performing Platform from publication analytics
    const platformEngagement: Record<string, number> = {};
    for (const post of recentPosts) {
      for (const pub of post.publications) {
        const analytics = (pub.analytics as any) || {};
        const score = (analytics.likes || 0) * 2 + (analytics.comments || 0) * 3 + (analytics.shares || 0) * 5 + (analytics.views || 0);
        platformEngagement[pub.platform] = (platformEngagement[pub.platform] || 0) + score;
      }
    }

    const sortedPlatforms = Object.entries(platformEngagement).sort((a, b) => b[1] - a[1]);
    const topPlatform = sortedPlatforms[0]?.[0] || company.socialAccounts[0]?.platform || "FACEBOOK";

    // 5. Query Central AI Platform to Synthesize Real Advice
    const prompt = `
You are the AI Marketing Advisor for ${company.name}, an online store in the ${company.companyCategory?.name || "Retail"} category.

STORE DATA SNAPSHOT (REAL DATA):
- Connected Social Platforms: ${company.socialAccounts.map((a) => a.platform).join(", ") || "None connected yet"}
- Total Posts in Last 30 Days: ${recentPosts.length}
- Top Performing Platform: ${topPlatform}
- Unpromoted Products in Catalog:
${unpromotedProducts.map((p) => `  * [ID: ${p.id}] ${p.name} (Category: ${p.category || "General"})`).join("\n") || "  None"}

USER QUESTION / GOAL:
"${question || "What marketing actions should I take this week to increase engagement and sales?"}"

INSTRUCTIONS:
1. Base all advice strictly on the real store data provided above. Do not fabricate analytics numbers or fake sales data.
2. Recommend specific unpromoted products from the list above.
3. Provide concrete actionable suggestions.

Format response as valid JSON:
{
  "answer": "Direct, professional, encouraging advice addressing the user's question",
  "recommendedActions": [
    {
      "type": "CREATE_POST",
      "title": "Action Title",
      "description": "Why and how to execute this action",
      "suggestedPlatform": "${topPlatform}"
    }
  ],
  "suggestedProductsToPromote": [
    ${unpromotedProducts.slice(0, 3).map((p) => `{
      "id": "${p.id}",
      "name": "${p.name.replace(/"/g, '\\"')}",
      "category": "${p.category || "General"}",
      "reason": "High-potential product that has not been promoted in recent campaigns"
    }`).join(",\n")}
  ]
}
`;

    const aiResult = await centralAIService.generateText(
      {
        prompt,
        temperature: 0.7,
        maxTokens: 1500,
        jsonSchema: true,
      },
      {
        companyId,
        capability: "SOCIAL_MARKETING",
        feature: "marketing_advisor",
        source: "WEB",
      }
    );

    let parsed: any;
    try {
      parsed = aiResult.json || JSON.parse(aiResult.text.replace(/```json/g, "").replace(/```/g, "").trim());
    } catch {
      return {
        answer: "Focus on highlighting your newer inventory across your connected social platforms with compelling visuals and clear calls-to-action.",
        recommendedActions: [
          {
            type: "CREATE_POST",
            title: "Promote unfeatured products",
            description: "Showcase items from your catalog that haven't received recent visibility.",
            suggestedPlatform: topPlatform,
          },
        ],
        suggestedProductsToPromote: unpromotedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          reason: "Product needs fresh social visibility",
        })),
        topPerformingPlatform: topPlatform,
      };
    }

    return {
      answer: parsed.answer,
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
      suggestedProductsToPromote: Array.isArray(parsed.suggestedProductsToPromote)
        ? parsed.suggestedProductsToPromote
        : [],
      topPerformingPlatform: topPlatform,
    };
  }
}

export const marketingAdvisor = new MarketingAdvisor();
