/**
 * app/api/stores/[id]/recommendations/route.ts
 *
 * GET /api/stores/:id/recommendations - Storefront recommendations strictly scoped to tenant products.
 * Parameter :id can be either company ID or company slug (resolved by findCompanyCached).
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { RecommendationService } from "@/lib/recommendations/recommendationService";

export const revalidate = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await findCompanyCached(id, "api");
    if (!company) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitorId") || undefined;
    const currentListingId = searchParams.get("currentListingId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "8", 10);

    const result = await RecommendationService.getStoreRecommendations(company.id, {
      userId,
      visitorId,
      currentListingId,
      limit,
    });

    return NextResponse.json({
      success: true,
      recommendations: result.recommendations,
      source: result.source,
      store: {
        id: company.id,
        name: company.name,
        slug: company.slug,
      },
    });
  } catch (error: any) {
    console.error("[STORE_RECOMMENDATIONS_ERROR]", error);
    return NextResponse.json(
      { success: false, recommendations: [], error: "Failed to load store recommendations" },
      { status: 500 }
    );
  }
}
