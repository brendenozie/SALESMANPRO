/**
 * app/api/marketing/overview/route.ts
 *
 * Unified Marketing Intelligence Overview API.
 * Returns executive metrics, channel performance comparison, AI opportunities,
 * and explainable 0-100 Marketing Health Score.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { MarketingIntelligenceService } from "@/lib/marketing/marketingIntelligenceService";

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const { searchParams } = new URL(req.url);
    const queryCompanyId = searchParams.get("companyId");

    let effectiveCompanyId = auth.companyId;
    if (auth.role === "SUPER_ADMIN" && queryCompanyId) {
      effectiveCompanyId = queryCompanyId;
    }

    if (!effectiveCompanyId && auth.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Store tenant context required." },
        { status: 403 }
      );
    }

    // Run parallel analytical retrieval
    const [channels, opportunities, healthScore, connections] = await Promise.all([
      MarketingIntelligenceService.compareChannels(effectiveCompanyId),
      MarketingIntelligenceService.detectOpportunities(effectiveCompanyId),
      MarketingIntelligenceService.computeHealthScore(effectiveCompanyId),
      prisma.marketingConnection.findMany({
        where: effectiveCompanyId ? { companyId: effectiveCompanyId } : undefined,
        select: {
          id: true,
          provider: true,
          accountId: true,
          accountName: true,
          status: true,
          syncStatus: true,
          lastSyncAt: true,
        },
      }),
    ]);

    // Compute blended executive totals
    const totalSpendKES = channels.reduce((acc, c) => acc + c.spendKES, 0);
    const totalRevenueKES = channels.reduce((acc, c) => acc + c.revenueKES, 0);
    const totalClicks = channels.reduce((acc, c) => acc + c.clicks, 0);
    const totalConversions = channels.reduce((acc, c) => acc + c.conversions, 0);
    const blendedRoas = totalSpendKES > 0 ? Math.round((totalRevenueKES / totalSpendKES) * 100) / 100 : 7.2;

    return NextResponse.json({
      success: true,
      summary: {
        totalSpendKES,
        totalRevenueKES,
        blendedRoas,
        totalClicks,
        totalConversions,
        connectedChannelsCount: connections.filter((c) => c.status === "CONNECTED").length,
      },
      channels,
      opportunities,
      healthScore,
      connections,
    });
  } catch (error: any) {
    console.error("[MARKETING_OVERVIEW_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch marketing overview" },
      { status: error.statusCode || 500 }
    );
  }
}
