/**
 * app/api/ai/generate/route.ts
 *
 * POST /api/ai/generate
 * Unified AI Generation Endpoint.
 * Supports legacy formats as well as modern unified structured payloads with full credit accounting.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { aiService } from "@/lib/ai/aiService";
import { enforceAiStudioAccess } from "@/lib/subscriptions/enforce-limits";
import { getCategoryDefaultData } from "@/lib/defaultStoreData";

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const isFirstStore = Boolean(auth.isFirstStore);

    // --- Subscription Plan Enforcement: AI Studio Feature Gate ---
    // If user is generating their first store, allow free AI generation.
    // Subsequent edits, updates, or stores require an active subscription and credit balance.
    if (!isFirstStore) {
      const aiCheck = await enforceAiStudioAccess(auth.companyId);
      if (!aiCheck.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: aiCheck.message,
            upgradeRequired: aiCheck.upgradeRequired,
          },
          { status: 403 }
        );
      }
    }

    const body = await req.json();

    let {
      prompt,
      systemPrompt,
      model,
      modelId = model,
      temperature = 0.7,
      maxTokens = 1500,
      jsonSchema,
      conversationHistory,
      feature = "legacy_generate",
      idempotencyKey,
      section,
      name,
      category,
      currentDescription,
    } = body;

    // Handle section-based store creation copilot calls from CreateStoreForm
    if (!prompt && section) {
      feature = `store_create_${section}`;
      systemPrompt = `You are SalesmanPro's Master eCommerce & Retail Business Architect. Generate high-converting, professional, tailored store content for the requested section. Return strictly valid JSON with no markdown wrapping.`;

      const storeName = name?.trim() || "My Store";
      const storeCat = category?.trim() || "Retail";
      const currDesc = currentDescription?.trim() || "";

      if (section === "basic") {
        prompt = `Generate a compelling brand tagline (under 12 words) and an engaging, professional business description (2-3 paragraphs) for "${storeName}", an online store in the "${storeCat}" industry. ${currDesc ? `Additional Context: ${currDesc}` : ""}\nReturn JSON with keys: {"tagline": "...", "description": "..."}`;
      } else if (section === "seo") {
        prompt = `Generate high-ranking SEO metadata for "${storeName}" in the "${storeCat}" industry. Return JSON with keys: {"seoTitle": "...", "seoDescription": "...", "keywords": ["...", "..."]}`;
      } else if (section === "pricing") {
        prompt = `Generate 3 competitive retail pricing tiers for "${storeName}" in the "${storeCat}" industry. Return JSON with key: {"pricingTiers": [{"name": "Basic", "price": 1000, "description": "...", "features": ["..."], "duration": "monthly"}, {"name": "Pro", "price": 2500, "description": "...", "features": ["..."], "duration": "monthly"}, {"name": "Premium", "price": 5000, "description": "...", "features": ["..."], "duration": "monthly"}]}`;
      } else if (section === "marketing") {
        prompt = `Generate 2 marketing hero slides (title, subtitle, description) and 2 promotional campaigns (title, description) for "${storeName}" in "${storeCat}".\nReturn JSON with keys: {"heroSlides": [{"title": "...", "subtitle": "...", "description": "..."}], "promotions": [{"title": "...", "description": "..."}]}`;
      } else if (section === "faqs") {
        prompt = `Generate 4 frequently asked questions with clear, reassuring answers for "${storeName}" in "${storeCat}".\nReturn JSON with key: {"faqs": [{"question": "...", "answer": "..."}]}`;
      } else {
        prompt = `Generate store content for "${storeName}" in "${storeCat}" for section ${section}.\nReturn JSON format.`;
      }
    }

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    let actionId = body.actionId;
    if (!actionId && section) {
      if (section === "seo") actionId = "PRODUCT_SEO";
      else if (section === "marketing") actionId = "MARKETING_CAMPAIGN";
      else actionId = "PRODUCT_DESCRIPTION";
    }

    let result: any = null;
    let parsedSectionData: Record<string, any> = {};

    try {
      result = await aiService.generateText(
        {
          prompt,
          systemPrompt,
          temperature,
          maxTokens,
          jsonSchema,
          conversationHistory,
        },
        {
          companyId: auth.companyId,
          userId: auth.userId,
          source: "WEB",
          feature,
          actionId: actionId || "GENERAL_TEXT",
          idempotencyKey,
          bypassCredits: isFirstStore,
          isFirstStore,
        },
      );

      // If this was a structured section request, extract JSON fields directly
      if (section) {
        try {
          const cleanText = result.text.replace(/```json\n?|\n?```/g, "").trim();
          parsedSectionData = JSON.parse(cleanText);
        } catch (err) {
          console.warn("[SECTION_JSON_PARSE_WARN] Falling back to category sample data", err);
          parsedSectionData = getSectionSampleFallback(section, category);
        }
      }
    } catch (aiErr: any) {
      console.warn("[AI_GENERATE_ERROR] AI service failed, attempting sample fallback:", aiErr?.message || aiErr);
      if (section) {
        parsedSectionData = getSectionSampleFallback(section, category);
        result = {
          text: JSON.stringify(parsedSectionData),
          json: parsedSectionData,
          model: "salesmanpro-sample-fallback",
          provider: "PLATFORM",
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          creditsConsumed: 0,
          executionTimeMs: 10,
        };
      } else {
        throw aiErr;
      }
    }

    return NextResponse.json({
      success: true,
      text: result.text,
      json: result.json || parsedSectionData,
      ...parsedSectionData,
      data: result,
      creditsConsumed: isFirstStore ? 0 : result.creditsConsumed,
      model: result.model,
      isFirstStoreFree: isFirstStore,
    });
  } catch (error: any) {
    console.error("[AI_GENERATE_ROUTE_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "AI generation failed",
        code: error.code || "GENERATION_FAILED",
      },
      { status: error.statusCode || 500 },
    );
  }
}

function getSectionSampleFallback(section: string, category?: string): Record<string, any> {
  const sample = getCategoryDefaultData(category || "Retail");
  if (section === "basic") {
    return {
      tagline: sample?.tagline || "Discover Premium Quality & Fast Delivery",
      description: sample?.description || "Curated collections with exceptional craft, direct from top creators.",
    };
  }
  if (section === "seo") {
    return {
      seoTitle: sample?.seo?.title || `${sample?.name || "Store"} | Online Shopping Experience`,
      seoDescription: sample?.seo?.description || "Browse our catalog for best prices, secure checkout, and fast shipping.",
      keywords: sample?.seo?.keywords || ["shopping", "online store", "fast shipping"],
    };
  }
  if (section === "pricing") {
    return {
      pricingTiers: sample?.pricingTiers || [
        { name: "Basic", price: 1000, description: "Essential starter package", features: ["Standard access", "Email support"], duration: "monthly" },
        { name: "Pro", price: 2500, description: "Most popular tier", features: ["Full catalog access", "Priority delivery", "24/7 support"], duration: "monthly" },
      ],
    };
  }
  if (section === "marketing") {
    return {
      heroSlides: sample?.heroSlides || [{ title: "Welcome to our store", subtitle: "Best Quality Assured", description: "Shop now for exclusive deals." }],
      promotions: sample?.promotions || [{ title: "Grand Opening Discount", description: "Get 15% off on all first-time purchases!" }],
    };
  }
  if (section === "faqs") {
    return {
      faqs: (sample?.faqs || [
        { question: "What are your delivery options?", answer: "We deliver countrywide within 1 to 3 business days." },
        { question: "Can I return an item?", answer: "Yes, we offer hassle-free 30-day returns on unworn items." },
      ]).map((f: any) => ({ question: f.question, answer: f.answer })),
    };
  }
  return {};
}
