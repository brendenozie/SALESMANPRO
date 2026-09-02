/**
 * app/api/social/content/generate/route.ts
 *
 * Generates tailored, platform-adapted social media copy & media using the AI Content Strategy Engine.
 * Reserves and deducts AI credits using the central SalesmanPro AI credit ledger.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { socialService } from "@/lib/social/socialService";
import { SocialContentType, SocialPlatform } from "@/lib/social/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();

    const {
      productId,
      campaignId,
      contentType = "TEXT",
      targetPlatforms,
      contentPillars,
      topicOrGoal,
      tone,
      scheduledAt,
      customInstructions,
      includeMediaGeneration,
      mediaType,
    } = body;

    if (!Array.isArray(targetPlatforms) || targetPlatforms.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select at least one target social platform." },
        { status: 400 }
      );
    }

    const result = await socialService.generateAndCreatePost({
      companyId: auth.companyId,
      userId: auth.userId,
      productId,
      campaignId,
      contentType: contentType as SocialContentType,
      targetPlatforms: targetPlatforms as SocialPlatform[],
      contentPillars,
      topicOrGoal,
      tone,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      customInstructions,
      includeMediaGeneration,
      mediaType,
    });

    return NextResponse.json({
      success: true,
      post: result.post,
      strategyResult: result.strategyResult,
    });
  } catch (error: any) {
    console.error("[POST /api/social/content/generate] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate social media content" },
      { status: error.statusCode || 500 }
    );
  }
}
