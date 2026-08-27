/**
 * app/api/ai/image/route.ts
 *
 * POST /api/ai/image
 * Generates or edits images with DALL-E, removes/replaces backgrounds,
 * persists to S3 and MediaAsset, and links to products.
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
      modelId = "dall-e-3",
      aspectRatio = "1:1",
      size,
      quality = "standard",
      style = "vivid",
      quantity = 1,
      action = "GENERATE_IMAGE",
      productId,
      marketplaceListingId,
      idempotencyKey,
    } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const result = await aiService.generateImage(
      {
        prompt,
        modelId,
        aspectRatio,
        size,
        quality,
        style,
        quantity,
        action,
        productId,
        marketplaceListingId,
      },
      {
        companyId: auth.companyId,
        userId: auth.userId,
        source: "WEB",
        feature: action,
        idempotencyKey,
      },
    );

    return NextResponse.json({
      success: true,
      data: result,
      images: result.images,
      creditsConsumed: result.creditsConsumed,
    });
  } catch (error: any) {
    console.error("[POST_AI_IMAGE_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Image generation failed",
        code: error.code || "GENERATION_FAILED",
      },
      { status: error.statusCode || 500 },
    );
  }
}
