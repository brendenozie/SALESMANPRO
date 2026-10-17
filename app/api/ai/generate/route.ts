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

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);

    // --- Subscription Plan Enforcement: AI Studio Feature Gate ---
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

    const result = await aiService.generateText(
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
      },
    );

    // If this was a structured section request, extract JSON fields directly
    let parsedSectionData: Record<string, any> = {};
    if (section) {
      try {
        const cleanText = result.text.replace(/```json\n?|\n?```/g, "").trim();
        parsedSectionData = JSON.parse(cleanText);
      } catch (err) {
        console.warn("[SECTION_JSON_PARSE_WARN]", err);
      }
    }

    // Provide both modern .data format, section-specific payload, and legacy direct response
    return NextResponse.json({
      success: true,
      text: result.text,
      json: result.json || parsedSectionData,
      ...parsedSectionData,
      data: result,
      creditsConsumed: result.creditsConsumed,
      model: result.model,
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
