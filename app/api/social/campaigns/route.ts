/**
 * app/api/social/campaigns/route.ts
 *
 * Lists and generates/creates marketing campaigns.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { contentStrategyEngine } from "@/lib/social/contentStrategyEngine";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await resolveAIAuth(req);

    const campaigns = await prisma.socialCampaign.findMany({
      where: { companyId: auth.companyId },
      include: {
        product: { select: { id: true, name: true, category: true, images: true } },
        _count: { select: { posts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    console.error("[GET /api/social/campaigns] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch campaigns" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();

    const { name, objective, productId, targetPlatforms, contentPillars, durationDays, budget } = body;

    if (!name || !objective || !targetPlatforms?.length || !contentPillars?.length) {
      return NextResponse.json(
        { success: false, error: "Campaign name, objective, platforms, and content pillars are required." },
        { status: 400 }
      );
    }

    const campaignResult = await contentStrategyEngine.generateCampaign({
      companyId: auth.companyId,
      name,
      objective,
      productId,
      targetPlatforms,
      contentPillars,
      durationDays,
      budget,
    });

    return NextResponse.json({
      success: true,
      campaign: campaignResult,
    });
  } catch (error: any) {
    console.error("[POST /api/social/campaigns] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create campaign" },
      { status: error.statusCode || 500 }
    );
  }
}
