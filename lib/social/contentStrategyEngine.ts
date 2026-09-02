/**
 * lib/social/contentStrategyEngine.ts
 *
 * SalesmanPro AI Content Strategy Engine.
 * Constructs category-aware, audience-driven, multi-platform social media strategies
 * and tailored content adaptations while enforcing zero-hallucination rules and
 * central AI credit accounting.
 */

import prisma from "@/server/db/prismadb";
import { centralAIService } from "@/lib/ai/aiService";
import {
  GenerateSocialContentInput,
  GenerateSocialContentOutput,
  GenerateCampaignInput,
  GenerateCampaignOutput,
  PlatformContentAdaptation,
  StoreContext,
  ProductContext,
  SocialPlatform,
  CONTENT_PILLARS,
} from "./types";
import { AIPlatformError } from "@/lib/ai/types";

export class ContentStrategyEngine {
  /**
   * Generates a platform-adapted social media post from Store & Product context.
   */
  public async generatePost(input: GenerateSocialContentInput): Promise<GenerateSocialContentOutput> {
    const { companyId, productId, contentType, targetPlatforms, topicOrGoal, tone } = input;

    // 1. Fetch Store Context and Brand Profile
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        socialBrandProfile: true,
        companyCategory: true,
      },
    });

    if (!company) {
      throw new AIPlatformError("TENANT_NOT_FOUND", "Store company not found", 404);
    }

    const storeContext: StoreContext = {
      companyId: company.id,
      name: company.name,
      slug: company.slug,
      category: company.companyCategory?.name || null,
      description: company.description,
      tagline: company.tagline,
      storefrontUrl: `https://salesmanpro.site/stores/${company.slug}`,
      brandVoice: company.socialBrandProfile?.brandVoice || "Professional, engaging and customer-focused",
      tone: tone || company.socialBrandProfile?.tone || "Inspiring and friendly",
      bannedWords: company.socialBrandProfile?.bannedWords || [],
      preferredCtas: company.socialBrandProfile?.preferredCtas || ["Shop Now", "Visit Store", "Contact Us", "Learn More"],
      preferredLanguage: company.socialBrandProfile?.preferredLanguage || "en",
    };

    // 2. Fetch Product Context if provided
    let productContext: ProductContext | null = null;
    if (productId) {
      const product = await prisma.product.findFirst({
        where: { id: productId, companyId },
      });

      if (product) {
        // Extract images and videos safely from Json[]
        const images = Array.isArray(product.images)
          ? product.images.map((img: any) => (typeof img === "string" ? img : img?.url)).filter(Boolean)
          : [];
        const videos = Array.isArray(product.videos)
          ? product.videos.map((vid: any) => (typeof vid === "string" ? vid : vid?.url)).filter(Boolean)
          : [];

        productContext = {
          id: product.id,
          name: product.name,
          description: product.description,
          longDescription: product.longDescription,
          category: product.category,
          subcategory: product.subCategoryName,
          brand: product.brand,
          images,
          videos,
          marketplaceUrl: `https://salesmanpro.site/marketplace/product/${product.id}`,
          tags: product.tags,
        };
      }
    }

    // 3. Construct System Prompt & Instructions
    const systemPrompt = this.buildStrategySystemPrompt(storeContext, productContext);
    const userPrompt = this.buildUserPrompt(storeContext, productContext, input);

    // 4. Generate Structured Content via Central AI Platform (consumes AI credits)
    const aiOutput = await centralAIService.generateText(
      {
        prompt: userPrompt,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 2500,
        jsonSchema: true,
      },
      {
        companyId,
        capability: "SOCIAL_MARKETING",
        feature: "social_content_strategy",
        source: "WEB",
      }
    );

    // 5. Parse and Validate AI Response
    let parsedData: any;
    try {
      if (aiOutput.json) {
        parsedData = aiOutput.json;
      } else {
        const cleaned = aiOutput.text.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedData = JSON.parse(cleaned);
      }
    } catch {
      throw new AIPlatformError("GENERATION_FAILED", "Failed to parse structured social strategy output", 500);
    }

    const primaryCopy: string = parsedData.primaryCopy || parsedData.caption || "Discover our latest collection!";
    const hashtags: string[] = Array.isArray(parsedData.hashtags) ? parsedData.hashtags : ["#SalesmanPro"];
    const callToAction: string = parsedData.callToAction || storeContext.preferredCtas?.[0] || "Shop Now";

    // 6. Build Platform Adaptations Map
    const adaptations: Record<string, PlatformContentAdaptation> = {};
    for (const platform of targetPlatforms) {
      const pData = parsedData.adaptations?.[platform] || {};
      adaptations[platform] = {
        platform,
        title: pData.title || undefined,
        caption: pData.caption || primaryCopy,
        hashtags: Array.isArray(pData.hashtags) ? pData.hashtags : hashtags,
        recommendedMediaType: pData.recommendedMediaType || (contentType === "VIDEO" ? "VIDEO" : "IMAGE"),
        aspectRatio: pData.aspectRatio || (platform === "TIKTOK" || platform === "INSTAGRAM" ? "9:16" : "16:9"),
        characterCount: (pData.caption || primaryCopy).length,
        hook: pData.hook || "Check this out!",
        callToAction: pData.callToAction || callToAction,
        videoScenePlan: pData.videoScenePlan || undefined,
        audioPrompt: pData.audioPrompt || undefined,
      };
    }

    // 7. Optional Media Generation
    const generatedMedia: Array<{ url: string; mediaType: "IMAGE" | "VIDEO"; mediaAssetId?: string }> = [];
    if (input.includeMediaGeneration && input.mediaType === "IMAGE") {
      try {
        const imagePrompt = parsedData.imageGenerationPrompt ||
          `Professional commercial advertisement photo for ${productContext?.name || storeContext.name}, high quality studio lighting, 8k`;
        
        const imgResult = await centralAIService.generateImage(
          {
            prompt: imagePrompt,
            aspectRatio: "1:1",
            quality: "standard",
            action: "GENERATE_IMAGE",
          },
          {
            companyId,
            capability: "IMAGE",
            source: "WEB",
            feature: "social_content_image",
          }
        );

        if (imgResult.images?.length) {
          generatedMedia.push({
            url: imgResult.images[0].url,
            mediaType: "IMAGE",
          });
        }
      } catch (mediaErr) {
        console.warn("Media generation failed during social post creation:", mediaErr);
      }
    }

    return {
      primaryCopy,
      hashtags,
      callToAction,
      adaptations: adaptations as Record<SocialPlatform, PlatformContentAdaptation>,
      recommendedBestTime: parsedData.recommendedBestTime,
      generatedMedia: generatedMedia.length ? generatedMedia : undefined,
      creditsConsumed: aiOutput.creditsConsumed,
    };
  }

  /**
   * Generates a comprehensive multi-platform Social Marketing Campaign.
   */
  public async generateCampaign(input: GenerateCampaignInput): Promise<GenerateCampaignOutput> {
    const { companyId, name, objective, productId, targetPlatforms, contentPillars, durationDays = 7 } = input;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { socialBrandProfile: true },
    });

    if (!company) {
      throw new AIPlatformError("TENANT_NOT_FOUND", "Store company not found", 404);
    }

    let productInfo = "";
    if (productId) {
      const prod = await prisma.product.findFirst({ where: { id: productId, companyId } });
      if (prod) {
        productInfo = `Product: ${prod.name}, Category: ${prod.category || "General"}, Description: ${prod.description || ""}`;
      }
    }

    const campaignPrompt = `
You are the Chief Social Media Marketing Strategist for SalesmanPro.
Create a high-converting ${durationDays}-day social media marketing campaign.

Campaign Details:
- Campaign Name: "${name}"
- Objective: ${objective}
- Target Platforms: ${targetPlatforms.join(", ")}
- Selected Content Pillars: ${contentPillars.join(", ")}
- Store: ${company.name}
- Brand Voice: ${company.socialBrandProfile?.brandVoice || "Engaging and authentic"}
${productInfo ? `- Focus Product Context: ${productInfo}` : ""}

Return a strictly valid JSON object:
{
  "strategySummary": "2-3 sentences explaining the campaign narrative and hook",
  "scheduleOverview": [
    {
      "dayNumber": 1,
      "platform": "${targetPlatforms[0]}",
      "contentType": "IMAGE",
      "pillar": "${contentPillars[0]}",
      "title": "Post Title",
      "hook": "Strong thumb-stopping hook",
      "previewCopy": "Engaging teaser copy with CTA"
    }
  ]
}
`;

    const aiOutput = await centralAIService.generateText(
      {
        prompt: campaignPrompt,
        temperature: 0.7,
        maxTokens: 3000,
        jsonSchema: true,
      },
      {
        companyId,
        capability: "SOCIAL_MARKETING",
        feature: "campaign_generation",
        source: "WEB",
      }
    );

    let parsed: any;
    try {
      parsed = aiOutput.json || JSON.parse(aiOutput.text.replace(/```json/g, "").replace(/```/g, "").trim());
    } catch {
      throw new AIPlatformError("GENERATION_FAILED", "Failed to parse campaign plan", 500);
    }

    // Create Campaign in database
    const createdCampaign = await prisma.socialCampaign.create({
      data: {
        companyId,
        name,
        objective,
        status: "ACTIVE",
        contentPillars,
        platforms: targetPlatforms,
        productId: productId || undefined,
        startDate: new Date(),
        endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        metadata: {
          strategySummary: parsed.strategySummary,
        },
      },
    });

    const scheduleItems = Array.isArray(parsed.scheduleOverview) ? parsed.scheduleOverview : [];

    return {
      campaignId: createdCampaign.id,
      name: createdCampaign.name,
      strategySummary: parsed.strategySummary || "Comprehensive Social Media Campaign",
      contentPillars,
      scheduleOverview: scheduleItems,
      createdPostsCount: scheduleItems.length,
      creditsConsumed: aiOutput.creditsConsumed,
    };
  }

  // ------------------------------------------------------------------
  // Prompt Construction Helpers
  // ------------------------------------------------------------------

  private buildStrategySystemPrompt(store: StoreContext, product: ProductContext | null): string {
    return `
You are the Senior AI Social Media Strategist & Creative Copywriter for SalesmanPro.
You specialize in creating high-performing, platform-native social media content that drives genuine engagement, follows official platform algorithms, and converts followers into buyers.

INDUSTRY & STORE CONTEXT:
- Store Name: ${store.name}
- Industry Category: ${store.category || "Retail & Commerce"}
- Subcategory: ${store.subCategoryName || "General"}
- Brand Voice: ${store.brandVoice}
- Tone: ${store.tone}
- Preferred Language: ${store.preferredLanguage}
- Preferred Call-to-Actions: ${store.preferredCtas?.join(", ")}
${store.bannedWords?.length ? `- Prohibited / Banned Words (DO NOT USE): ${store.bannedWords.join(", ")}` : ""}

CRITICAL INTEGRITY INVARIANTS:
1. NEVER invent or hallucinate product prices, discounts, fake percentages, artificial warranties, or stock counts.
2. If product information is provided, strictly preserve the product identity, real specifications, and facts.
3. If no product price is provided, do NOT mention an arbitrary price. Direct users to the store or marketplace link instead.
4. Adapt content genuinely per platform rather than copying the exact same text:
   - FACEBOOK: Conversational, community-focused, includes clear link placement and readable paragraph breaks.
   - INSTAGRAM: Highly visual caption, first-line scroll-stopping hook, line breaks, 8-15 tailored hashtags, strong CTA.
   - TIKTOK: Short, energetic caption, 3-5 trending hashtags, includes a 3-second visual video scene hook.
   - YOUTUBE: Click-worthy search-optimized title, comprehensive description with timestamps or links, Shorts hook if 9:16.
`;
  }

  private buildUserPrompt(
    store: StoreContext,
    product: ProductContext | null,
    input: GenerateSocialContentInput
  ): string {
    return `
Generate a platform-optimized social media campaign post.

REQUEST DETAILS:
- Target Platforms: ${input.targetPlatforms.join(", ")}
- Content Type: ${input.contentType}
${input.contentPillars?.length ? `- Target Content Pillars: ${input.contentPillars.join(", ")}` : ""}
${input.topicOrGoal ? `- Campaign Topic / Objective: ${input.topicOrGoal}` : ""}
${input.customInstructions ? `- Custom Instructions: ${input.customInstructions}` : ""}

${product ? `PRODUCT DETAILS:
- Name: ${product.name}
- Category: ${product.category || "General"}
- Details: ${product.description || product.longDescription || "Quality item"}
- Marketplace URL: ${product.marketplaceUrl || store.storefrontUrl}
` : `STORE PROMOTION:
- Store Tagline: ${store.tagline || ""}
- Description: ${store.description || ""}
- Storefront URL: ${store.storefrontUrl}
`}

RETURN FORMAT (Must be strictly valid JSON without markdown wrapping):
{
  "primaryCopy": "The main compelling copy concept",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "callToAction": "Direct action phrase",
  "imageGenerationPrompt": "Visual prompt if generating an accompanying AI image",
  "recommendedBestTime": {
    "dayOfWeek": "Wednesday",
    "hourUtc": 14,
    "explanation": "Peak shopping engagement hour for this category"
  },
  "adaptations": {
    ${input.targetPlatforms.map((p) => `"${p}": {
      "title": "${p === "YOUTUBE" ? "YouTube Title" : ""}",
      "caption": "Platform-specific caption tailored for ${p}",
      "hashtags": ["#tag1", "#tag2"],
      "recommendedMediaType": "IMAGE",
      "aspectRatio": "${p === "TIKTOK" || p === "INSTAGRAM" ? "9:16" : "16:9"}",
      "hook": "Opening hook for ${p}",
      "callToAction": "Platform CTA",
      "videoScenePlan": [
        {
          "sceneNumber": 1,
          "durationSeconds": 3,
          "visualDescription": "Opening visual hook",
          "narrationOrTextOverlay": "On-screen text or voiceover"
        }
      ]
    }`).join(",\n")}
  }
}
`;
  }
}

export const contentStrategyEngine = new ContentStrategyEngine();
