/**
 * app/api/ai/workforce/approvals/route.ts
 *
 * Query Human-in-the-loop approvals across Store and Platform tiers.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { AgentApprovalStatus } from "@/lib/ai/workforce/types";

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const { searchParams } = new URL(req.url);

    const status = (searchParams.get("status") as AgentApprovalStatus) || AgentApprovalStatus.PENDING;
    const limit = Math.min(Number(searchParams.get("limit") || 20), 100);
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const skip = (page - 1) * limit;

    const isSuperAdmin = auth.role === "SUPER_ADMIN";

    const where: any = {};
    if (!isSuperAdmin) {
      where.companyId = auth.companyId;
    }

    if (status && status !== ("ALL" as any)) {
      where.status = status;
    }

    const [approvals, total] = await Promise.all([
      prisma.aIAgentApproval.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          agent: {
            select: {
              key: true,
              name: true,
              level: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      }),
      prisma.aIAgentApproval.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      approvals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("[WORKFORCE_APPROVALS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to query approvals" },
      { status: error.statusCode || 500 },
    );
  }
}
