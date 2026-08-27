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

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();

    const {
      prompt,
      systemPrompt,
      model,
      modelId = model,
      temperature,
      maxTokens,
      jsonSchema,
      conversationHistory,
      feature = "legacy_generate",
      idempotencyKey,
    } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const result = await aiService.generateText(
      {
        prompt,
        systemPrompt,
        modelId,
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
        idempotencyKey,
      },
    );

    // Provide both modern .data format and legacy direct response
    return NextResponse.json({
      success: true,
      text: result.text,
      json: result.json,
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
