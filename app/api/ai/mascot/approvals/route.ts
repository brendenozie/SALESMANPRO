/**
 * app/api/ai/mascot/approvals/route.ts
 *
 * Approvals Management API for SalesmanPro Mascot Operations.
 * Enforces tenant-isolation, lists pending human-in-the-loop requests,
 * and allows store administrators to review sensitive actions.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { canAccessCompanyAdmin } from "@/lib/auth/authorization";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || (session.user as any).companyId;
    const status = searchParams.get("status") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!companyId) {
      return NextResponse.json({ success: false, error: "companyId is required" }, { status: 400 });
    }

    // Tenant authorization check
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, userId: true },
    });

    if (!company) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const hasAccess = canAccessCompanyAdmin({
      user: {
        id: session.user.id,
        role: (session.user as any).role,
        companyId: (session.user as any).companyId,
        emailVerified: (session.user as any).emailVerified,
        isActive: (session.user as any).isActive,
      },
      company: { id: company.id, userId: company.userId },
    });

    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    const whereClause: any = { companyId: company.id };
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const approvals = await (prisma as any).aIAgentApproval.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
      include: {
        task: {
          select: {
            id: true,
            title: true,
            taskType: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      approvals: approvals.map((a: any) => ({
        id: a.id,
        taskId: a.taskId,
        taskTitle: a.task?.title || a.title,
        actionType: a.actionType,
        title: a.title,
        description: a.description,
        proposedAction: a.proposedAction,
        status: a.status,
        reviewedBy: a.reviewedBy,
        reviewedAt: a.reviewedAt,
        rejectionReason: a.rejectionReason,
        expiresAt: a.expiresAt,
        createdAt: a.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch approvals" },
      { status: 500 }
    );
  }
}
