/**
 * app/api/ghuba/comments/[id]/report/route.ts
 *
 * POST /api/ghuba/comments/:id/report - Report a comment for spam, abuse, or moderation review
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const { id } = await params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const reason = typeof body?.reason === "string" ? body.reason.slice(0, 200) : "Inappropriate content";

    const comment = await prisma.marketplaceListingComment.findUnique({
      where: { id },
      select: { id: true, reportCount: true, reports: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const nextCount = (comment.reportCount || 0) + 1;
    const newReport = {
      reportedBy: userId || "anonymous",
      reason,
      reportedAt: new Date().toISOString(),
    };

    const updatedReports = [...(Array.isArray(comment.reports) ? comment.reports : []), newReport];

    // If reportCount >= 3, flag for immediate review (PENDING/REPORTED)
    const nextModerationStatus = nextCount >= 3 ? "REPORTED" : undefined;

    await prisma.marketplaceListingComment.update({
      where: { id },
      data: {
        reportCount: nextCount,
        reports: updatedReports,
        ...(nextModerationStatus ? { moderationStatus: nextModerationStatus } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comment reported for review",
    });
  } catch (error: any) {
    console.error("[REPORT_COMMENT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to report comment" },
      { status: 500 }
    );
  }
}
