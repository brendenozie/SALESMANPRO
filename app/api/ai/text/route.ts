/**
 * app/api/ai/text/route.ts
 *
 * POST /api/ai/text
 * Synchronous text generation, copy rewriting, marketing copy, and structured JSON.
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
      modelId,
      temperature,
      maxTokens,
      jsonSchema,
      conversationHistory,
      feature = "general_text",
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

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[POST_AI_TEXT_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Text generation failed",
        code: error.code || "GENERATION_FAILED",
      },
      { status: error.statusCode || 500 },
    );
  }
}
