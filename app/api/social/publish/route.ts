/**
 * app/api/social/publish/route.ts
 *
 * Publishes an approved social post immediately to connected platforms
 * or schedules it for background delivery via BullMQ.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { socialService } from "@/lib/social/socialService";
import prisma from "@/server/db/prismadb";
import { socialJobQueue } from "@/lib/social/queue/socialQueue";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();

    const { postId, scheduledAt } = body;

    if (!postId) {
      return NextResponse.json({ success: false, error: "postId is required" }, { status: 400 });
    }

    if (scheduledAt) {
      const scheduleDate = new Date(scheduledAt);
      const post = await prisma.socialMediaPost.update({
        where: { id: postId },
        data: {
          scheduledAt: scheduleDate,
          status: "SCHEDULED",
          isApproved: true,
        },
      });

      // Update publication records
      await prisma.socialPublication.updateMany({
        where: { postId, companyId: auth.companyId },
        data: {
          scheduledAt: scheduleDate,
          status: "SCHEDULED",
        },
      });

      const delayMs = Math.max(0, scheduleDate.getTime() - Date.now());
      await socialJobQueue.add(
        "PUBLISH_SCHEDULED_POST",
        { companyId: auth.companyId, postId },
        { delay: delayMs, jobId: `post_${postId}_${Date.now()}` }
      );

      return NextResponse.json({
        success: true,
        scheduled: true,
        scheduledAt: scheduleDate,
        post,
      });
    }

    // Check if synchronous execution is explicitly requested (e.g. for deterministic testing)
    const isAsync = body.async !== false;

    if (isAsync) {
      await prisma.socialMediaPost.update({
        where: { id: postId },
        data: {
          status: "PUBLISHING",
          isApproved: true,
        },
      });

      const job = await socialJobQueue.add(
        "PUBLISH_IMMEDIATE_POST",
        { companyId: auth.companyId, postId, action: "PUBLISH_SCHEDULED_POST" },
        { jobId: `publish_imm_${postId}_${Date.now()}` }
      );

      return NextResponse.json(
        {
          success: true,
          queued: true,
          status: "QUEUED",
          jobId: job.id,
          message: "Social post publication enqueued successfully to BullMQ worker",
        },
        { status: 202 }
      );
    }

    // Synchronous execution path
    const result = await socialService.publishNow(auth.companyId, postId);

    return NextResponse.json({
      success: result.success,
      results: result.results,
      status: result.finalStatus,
    });
  } catch (error: any) {
    console.error("[POST /api/social/publish] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute publish action" },
      { status: error.statusCode || 500 }
    );
  }
}
