/**
 * app/api/media/ai/route.ts
 *
 * POST /api/media/ai
 * Compatibility & direct media transformation endpoint routing to Central AI Service.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { aiService } from "@/lib/ai/aiService";
import prisma from "@/server/db/prismadb";
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

    const { mediaId, action = "GENERATE_IMAGE", config = {} } = body;
    const prompt = config.prompt || body.prompt;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    let referenceImageUrl: string | undefined;
    if (mediaId) {
      const media = await prisma.mediaAsset.findUnique({
        where: { id: mediaId },
      });
      if (media && media.companyId === auth.companyId) {
        referenceImageUrl = media.url;
      }
    }

    const result = await aiService.generateImage(
      {
        prompt,
        action,
        referenceImageUrl,
        aspectRatio: config.aspectRatio || "1:1",
        style: config.style || "vivid",
      },
      {
        companyId: auth.companyId,
        userId: auth.userId,
        source: "WEB",
        feature: `media_${action.toLowerCase()}`,
      },
    );

    return NextResponse.json({
      success: true,
      job: {
        id: result.images[0]?.mediaAssetId || `job_${Date.now()}`,
        status: "COMPLETED",
      },
      images: result.images,
      media: result.images[0],
      creditsConsumed: result.creditsConsumed,
    });
  } catch (error: any) {
    console.error("[POST_MEDIA_AI_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Media AI processing failed",
        code: error.code || "GENERATION_FAILED",
      },
      { status: error.statusCode || 500 },
    );
  }
}
