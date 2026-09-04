/**
 * app/api/ai/workforce/escalations/route.ts
 *
 * List and filter AI Agent Human Escalation tickets.
 * Store managers access escalations for their store; Super Admins access platform-wide.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

    const where: any = {};

    // Multi-tenant boundary
    if (auth.role !== "SUPER_ADMIN") {
      if (!auth.companyId) {
        return NextResponse.json(
          { success: false, error: "Store tenant context required" },
          { status: 400 },
        );
      }
      where.companyId = auth.companyId;
    } else {
      const queryCompanyId = searchParams.get("companyId");
      if (queryCompanyId) {
        where.companyId = queryCompanyId;
      }
    }

    if (status) {
      where.status = status;
    }

    const escalations = await prisma.aIAgentEscalation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    const pendingCount = await prisma.aIAgentEscalation.count({
      where: { ...where, status: "PENDING" },
    });

    return NextResponse.json({
      success: true,
      escalations,
      pendingCount,
    });
  } catch (error: any) {
    console.error("[WORKFORCE_ESCALATIONS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch escalations" },
      { status: error.statusCode || 500 },
    );
  }
}
