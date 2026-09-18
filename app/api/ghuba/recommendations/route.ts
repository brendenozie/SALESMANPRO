/**
 * app/api/ghuba/recommendations/route.ts
 *
 * GET /api/ghuba/recommendations - Personalized & trending recommendations for Ghuba homepage
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { RecommendationService } from "@/lib/recommendations/recommendationService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitorId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    const result = await RecommendationService.getGhubaHomepageRecommendations({
      userId,
      visitorId,
      limit,
    });

    return NextResponse.json({
      success: true,
      recommendations: result.recommendations,
      source: result.source,
    });
  } catch (error: any) {
    console.error("[GHUBA_RECOMMENDATIONS_ERROR]", error);
    return NextResponse.json(
      { success: false, recommendations: [], error: "Failed to load recommendations" },
      { status: 500 }
    );
  }
}
