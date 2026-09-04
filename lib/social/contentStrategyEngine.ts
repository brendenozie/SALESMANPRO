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
import { creditLedger } from "@/lib/ai/creditLedger";
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
  ScheduledCampaignPostItem,
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
   * Generates a comprehensive multi-platform, multi-day Social Marketing Campaign.
   * Supports Single Day, 1 Week, 2 Weeks, 1 Month, and Custom Ranges with sequential narrative,
   * inventory validation, credit pre-reservation, and atomic post persistence.
   */
  public async generateCampaign(input: GenerateCampaignInput): Promise<GenerateCampaignOutput> {
    const {
      companyId,
      name,
      objective,
      productId,
      productIds,
      targetPlatforms,
      contentPillars,
      planningMode = "ONE_WEEK",
      postingFrequency = "DAILY",
      preferredPostingTimes = ["10:00 AM", "06:00 PM"],
      contentMix,
      tone,
      promotionOrOffer,
      callToAction,
      includeMediaGeneration = false,
    } = input;

    // 1. Calculate Campaign Duration & Dates
    let totalDays = 7;
    let start = input.startDate ? new Date(input.startDate) : new Date();
    if (isNaN(start.getTime())) start = new Date();

    if (planningMode === "SINGLE_DAY") {
      totalDays = 1;
    } else if (planningMode === "ONE_WEEK") {
      totalDays = 7;
    } else if (planningMode === "TWO_WEEKS") {
      totalDays = 14;
    } else if (planningMode === "ONE_MONTH") {
      totalDays = 30;
    } else if (planningMode === "CUSTOM_RANGE" && input.startDate && input.endDate) {
      const end = new Date(input.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      totalDays = Math.max(1, Math.min(60, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));
    } else if (input.durationDays) {
      totalDays = Math.max(1, Math.min(60, input.durationDays));
    }

    const end = new Date(start.getTime() + totalDays * 24 * 60 * 60 * 1000);

    // 2. Fetch Tenant Company and Brand Voice
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { socialBrandProfile: true },
    });

    if (!company) {
      throw new AIPlatformError("TENANT_NOT_FOUND", "Store company not found", 404);
    }

    // 3. Pre-flight AI Credit Estimation & Reservation
    // Base cost: ~5 credits for strategy + ~2 credits per post schedule
    const estimatedCredits = Math.max(10, Math.ceil(totalDays * 2.5 * (includeMediaGeneration ? 4 : 1)));
    const hasCredits = await creditLedger.hasSufficientCredits(companyId, estimatedCredits);

    if (!hasCredits) {
      const currentBal = await creditLedger.getBalance(companyId);
      throw new AIPlatformError(
        "INSUFFICIENT_CREDITS",
        `Insufficient AI credits for ${totalDays}-day campaign generation. Estimated: ${estimatedCredits} credits, Available: ${currentBal} credits. Please reduce campaign duration or top up credits.`,
        402,
        { required: estimatedCredits, available: currentBal }
      );
    }

    const reservation = await creditLedger.reserveCredits({
      companyId,
      amount: estimatedCredits,
      description: `Campaign AI Generation: ${name} (${totalDays} days)`,
      idempotencyKey: `camp_res_${companyId}_${Date.now()}`,
    });

    try {
      // 4. Ingest Authoritative Store Catalog Products (Inventory-Aware)
      const targetProductIds: string[] = [];
      if (productId) targetProductIds.push(productId);
      if (Array.isArray(productIds)) {
        for (const pId of productIds) {
          if (!targetProductIds.includes(pId)) targetProductIds.push(pId);
        }
      }

      const storeProducts = await prisma.product.findMany({
        where: {
          companyId,
          ...(targetProductIds.length > 0 ? { id: { in: targetProductIds } } : {}),
        },
        take: 12,
        select: {
          id: true,
          name: true,
          category: true,
          subCategoryName: true,
          sellingPrice: true,
          discount: true,
          quantity: true,
          description: true,
          brand: true,
          images: true,
        },
      });

      // Format product context with inventory awareness
      const availableProducts = storeProducts.filter((p) => (p.quantity ?? 1) > 0);
      const outOfStockProducts = storeProducts.filter((p) => (p.quantity ?? 1) <= 0);

      const productsPromptContext = availableProducts.map((p) => {
        const primaryImg = Array.isArray(p.images) && p.images[0]
          ? (typeof p.images[0] === "string" ? p.images[0] : (p.images[0] as any)?.url)
          : null;
        return `[Product ID: ${p.id}] Name: "${p.name}", Category: "${p.category || "General"}", Price: KES ${p.sellingPrice}, Stock Available: ${p.quantity}, Details: "${p.description || ""}"${primaryImg ? `, Image: ${primaryImg}` : ""}`;
      }).join("\n");

      // Content Mix Breakdown
      const mix = {
        promotional: contentMix?.promotional ?? 40,
        educational: contentMix?.educational ?? 20,
        engagement: contentMix?.engagement ?? 15,
        brand: contentMix?.brand ?? 15,
        offers: contentMix?.offers ?? 10,
      };

      // 5. Construct Structured AI Prompt
      const campaignPrompt = `
You are the Chief Social Media Marketing Strategist for SalesmanPro.
Create a high-converting ${totalDays}-day social media marketing campaign.

CAMPAIGN PARAMETERS:
- Campaign Name: "${name}"
- Objective: ${objective}
- Planning Mode: ${planningMode} (${totalDays} Days)
- Start Date: ${start.toISOString().split("T")[0]}
- Target Platforms: ${targetPlatforms.join(", ")}
- Selected Content Pillars: ${contentPillars.join(", ")}
- Preferred Tone: ${tone || company.socialBrandProfile?.tone || "Engaging and trustworthy"}
- Brand Voice: ${company.socialBrandProfile?.brandVoice || "Professional, relatable, customer-centric"}
- Posting Frequency: ${postingFrequency}
- Preferred Posting Times: ${preferredPostingTimes.join(", ")}
${promotionOrOffer ? `- Featured Promotion / Offer: "${promotionOrOffer}"` : ""}
${callToAction ? `- Core Call to Action: "${callToAction}"` : ""}

CONTENT MIX DISTRIBUTION:
- ${mix.promotional}% Product Promotion
- ${mix.educational}% Educational & How-To
- ${mix.engagement}% Community & Engagement
- ${mix.brand}% Brand Awareness & Values
- ${mix.offers}% Limited-Time Offers & Deals

AUTHORITATIVE STORE PRODUCTS (CRITICAL INTEGRITY INVARIANT: Use ONLY real products from this list; NEVER invent fake product names, prices, or fake discounts):
${productsPromptContext || "No catalog products provided. Focus campaign around the store brand and offerings."}
${outOfStockProducts.length > 0 ? `NOTE: The following products are currently OUT OF STOCK and MUST NOT be featured: ${outOfStockProducts.map(o => o.name).join(", ")}` : ""}

CAMPAIGN SEQUENCING RULES:
The campaign must follow a logical narrative arc across the ${totalDays} days:
- Day 1: High-impact Campaign Announcement & Hook
- Day 2: Product Education & Problem Spotlight
- Day 3: Feature Highlight & Craftsmanship
- Day 4: Customer Problem → Solution Transformation
- Day 5: Product Comparison & Social Proof
- Day 6: Exclusive Incentive / Special Offer
- Day 7: Urgent Call-to-Action / Final Chance
(For longer campaigns, cycle through these themes with fresh angles, varying formats, hooks, and questions).

Return a strictly valid JSON object with this exact shape:
{
  "strategySummary": "2-3 sentences explaining the campaign narrative, emotional hook, and core conversion thesis",
  "scheduleOverview": [
    {
      "dayNumber": 1,
      "scheduledDate": "${start.toISOString().split("T")[0]}",
      "scheduledTime": "${preferredPostingTimes[0] || "10:00 AM"}",
      "platform": "${targetPlatforms[0]}",
      "contentType": "IMAGE",
      "pillar": "${contentPillars[0]}",
      "productId": "${availableProducts[0]?.id || ""}",
      "productName": "${availableProducts[0]?.name || ""}",
      "title": "Short internal post title",
      "hook": "1-sentence scroll-stopping opening hook",
      "content": "Full caption copy tailored for the platform including paragraphs and emojis",
      "hashtags": ["#SalesmanPro", "#Ecommerce"],
      "callToAction": "${callToAction || "Shop Now"}"
    }
  ]
}
`;

      const aiOutput = await centralAIService.generateText(
        {
          prompt: campaignPrompt,
          temperature: 0.7,
          maxTokens: 4000,
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
        throw new AIPlatformError("GENERATION_FAILED", "Failed to parse campaign plan JSON", 500);
      }

      // 6. Create SocialCampaign Record in Database
      const createdCampaign = await prisma.socialCampaign.create({
        data: {
          companyId,
          name,
          objective,
          status: "ACTIVE",
          contentPillars,
          platforms: targetPlatforms,
          productId: availableProducts[0]?.id || undefined,
          startDate: start,
          endDate: end,
          frequency: postingFrequency,
          metadata: {
            planningMode,
            strategySummary: parsed.strategySummary,
            contentMix: mix,
            totalDays,
          },
        },
      });

      // 7. Persist Individual SocialMediaPost Records
      const rawSchedule = Array.isArray(parsed.scheduleOverview)
        ? parsed.scheduleOverview
        : Array.isArray(parsed.posts)
        ? parsed.posts.map((p: any) => ({
            dayNumber: p.dayNumber ?? p.dayIndex,
            scheduledTime: p.scheduledTime,
            platform: p.platform,
            contentType: p.contentType,
            pillar: p.pillar ?? p.contentPillar,
            productName: p.productName,
            productId: p.productId,
            title: p.title || p.topicOrAngle,
            hook: p.hook || p.topicOrAngle,
            content: p.content || p.suggestedPrimaryCaption,
            hashtags: p.hashtags,
            callToAction: p.callToAction,
          }))
        : [];
      const scheduledPosts: ScheduledCampaignPostItem[] = [];

      for (let i = 0; i < rawSchedule.length; i++) {
        const item = rawSchedule[i];
        const dayOffset = (item.dayNumber ? item.dayNumber - 1 : i);
        const postDate = new Date(start.getTime() + dayOffset * 24 * 60 * 60 * 1000);

        // Map time string (e.g. "10:00 AM" or "06:00 PM")
        if (item.scheduledTime && typeof item.scheduledTime === "string") {
          const timeMatch = item.scheduledTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            const meridiem = timeMatch[3]?.toUpperCase();
            if (meridiem === "PM" && hours < 12) hours += 12;
            if (meridiem === "AM" && hours === 12) hours = 0;
            postDate.setHours(hours, minutes, 0, 0);
          }
        }

        const validProductId = availableProducts.find(p => p.id === item.productId)?.id || availableProducts[0]?.id;

        // Create the post in database
        const createdPost = await prisma.socialMediaPost.create({
          data: {
            companyId,
            campaignId: createdCampaign.id,
            productId: validProductId || undefined,
            title: item.title || `Day ${item.dayNumber || i + 1}: ${item.pillar}`,
            content: item.content || item.hook || "Discover our latest featured product!",
            hashtags: Array.isArray(item.hashtags) ? item.hashtags : ["#SalesmanPro"],
            targetPlatforms: [item.platform || targetPlatforms[0]],
            contentType: item.contentType || "TEXT",
            status: "SCHEDULED",
            scheduledAt: postDate,
            callToAction: item.callToAction || callToAction || "Shop Now",
            approvalMode: "MANUAL",
            isApproved: false,
            metadata: {
              dayNumber: item.dayNumber || i + 1,
              hook: item.hook,
              pillar: item.pillar,
            },
          },
        });

        scheduledPosts.push({
          dayNumber: item.dayNumber || i + 1,
          scheduledDate: postDate.toISOString().split("T")[0],
          scheduledTime: item.scheduledTime || "10:00 AM",
          platform: item.platform || targetPlatforms[0],
          contentType: item.contentType || "TEXT",
          pillar: item.pillar || contentPillars[0],
          productName: item.productName || availableProducts[0]?.name,
          productId: validProductId,
          title: item.title || `Day ${item.dayNumber || i + 1}: ${item.pillar}`,
          hook: item.hook || "",
          content: item.content || "",
          hashtags: Array.isArray(item.hashtags) ? item.hashtags : [],
          callToAction: item.callToAction || "Shop Now",
          postId: createdPost.id,
          status: createdPost.status,
        });
      }

      // 8. Finalize Credit Consumption
      const actualCredits = Math.max(10, Math.ceil(scheduledPosts.length * 2.5));
      await creditLedger.finalizeCharge({
        companyId,
        reservedAmount: estimatedCredits,
        actualAmount: actualCredits,
        description: `Campaign AI Generation: ${name} (${scheduledPosts.length} posts created)`,
        referenceId: createdCampaign.id,
        usageData: {
          capability: "SOCIAL_MARKETING",
          provider: "PLATFORM",
          model: "gemini-flash",
          feature: "campaign_generation",
        },
      });

      return {
        campaignId: createdCampaign.id,
        name: createdCampaign.name,
        strategySummary: parsed.strategySummary || "Strategic Multi-Day Campaign Plan",
        planningMode,
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
        contentPillars,
        scheduleOverview: scheduledPosts,
        scheduledPosts,
        createdPostsCount: scheduledPosts.length,
        creditsConsumed: actualCredits,
        campaign: {
          id: createdCampaign.id,
          name: createdCampaign.name,
          postCount: scheduledPosts.length,
          status: createdCampaign.status,
        },
      };
    } catch (genError: any) {
      // Refund reserved credits on generation failure
      await creditLedger.refundCredits({
        companyId,
        amount: estimatedCredits,
        description: `Refund: Campaign Generation Failed (${name})`,
        referenceId: reservation.transactionId,
      });
      throw genError;
    }
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
