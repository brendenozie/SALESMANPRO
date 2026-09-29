/**
 * app/api/ai/video/route.ts
 *
 * POST /api/ai/video
 * Dispatches asynchronous AI video generation (promotional product reels, animations).
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { aiService } from "@/lib/ai/aiService";
import { aiJobQueue } from "@/lib/ai/queue/aiQueue";
import { enforceVideoGenerationAccess } from "@/lib/subscriptions/enforce-limits";

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);

    // --- Subscription Plan Enforcement: AI Video Generation Gate ---
    const videoCheck = await enforceVideoGenerationAccess(auth.companyId);
    if (!videoCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: videoCheck.message,
          upgradeRequired: videoCheck.upgradeRequired,
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      prompt,
      modelId = "salesman-video-v1",
      durationSeconds = 5,
      aspectRatio = "16:9",
      sourceImageUrl,
      productId,
      marketplaceListingId,
      albumId,
      title,
      description,
      idempotencyKey,
    } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const result = await aiService.generateVideo(
      {
        prompt,
        modelId,
        durationSeconds,
        aspectRatio,
        sourceImageUrl,
        productId,
        marketplaceListingId,
        albumId,
        title,
        description,
      },
      {
        companyId: auth.companyId,
        userId: auth.userId,
        source: "WEB",
        feature: "video_generation",
        idempotencyKey,
      },
    );

    // Queue BullMQ job for background rendering worker
    try {
      await aiJobQueue.add(
        "generate_video",
        {
          jobId: result.jobId,
          companyId: auth.companyId,
          userId: auth.userId,
          capability: "VIDEO",
          action: "GENERATE_VIDEO",
          prompt,
          options: { durationSeconds, aspectRatio, title },
          inputAssets: { sourceImageUrl, productId, marketplaceListingId, albumId },
        },
        {
          jobId: result.jobId,
        },
      );
    } catch (qErr) {
      console.warn("[BULLMQ_QUEUE_ADD_WARNING]", qErr);
    }

    return NextResponse.json({
      success: true,
      data: result,
      jobId: result.jobId,
      status: result.status,
      message: "Video generation job submitted successfully",
    });
  } catch (error: any) {
    console.error("[POST_AI_VIDEO_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Video generation job dispatch failed",
        code: error.code || "GENERATION_FAILED",
      },
      { status: error.statusCode || 500 },
    );
  }
}
