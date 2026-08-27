/**
 * app/api/ai/generations/[id]/route.ts
 *
 * GET /api/ai/generations/:id - Poll job status and retrieve generated outputs.
 * POST /api/ai/generations/:id - Cancel or retry job.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { aiService } from "@/lib/ai/aiService";
import { creditLedger } from "@/lib/ai/creditLedger";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await resolveAIAuth(req);
    const job = await aiService.getGenerationJob(params.id, auth.companyId);

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error: any) {
    console.error("[GET_GENERATION_JOB_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch job" },
      { status: error.statusCode || 500 },
    );
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || "CANCEL";

    const job = await prisma.aIGenerationJob.findUnique({
      where: { id: params.id },
    });

    if (!job || job.companyId !== auth.companyId) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    if (action === "CANCEL" && (job.status === "QUEUED" || job.status === "PROCESSING")) {
      await prisma.aIGenerationJob.update({
        where: { id: job.id },
        data: { status: "CANCELLED" },
      });

      if (job.creditsReserved > 0) {
        await creditLedger.refundCredits({
          companyId: auth.companyId,
          userId: auth.userId,
          amount: job.creditsReserved,
          description: `Refund for cancelled AI job ${job.id}`,
          referenceId: job.id,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Job cancelled and credits refunded successfully",
      });
    }

    return NextResponse.json({ success: false, error: `Invalid action '${action}' for status '${job.status}'` }, { status: 400 });
  } catch (error: any) {
    console.error("[POST_GENERATION_JOB_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Operation failed" },
      { status: error.statusCode || 500 },
    );
  }
}
