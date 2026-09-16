/**
 * app/api/listings/[id]/similar/route.ts
 *
 * GET /api/listings/:id/similar - Similar listings for product detail pages
 */

import { NextRequest, NextResponse } from "next/server";
import { extractListingId } from "@/lib/ghuba-slug";
import { RecommendationService } from "@/lib/recommendations/recommendationService";

export const revalidate = 120; // 2 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listingId = extractListingId(id);

    if (!listingId || !/^[0-9a-fA-F]{24}$/.test(listingId)) {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "4", 10);

    const similar = await RecommendationService.getSimilarListings(listingId, limit);

    return NextResponse.json({
      success: true,
      similar,
    });
  } catch (error: any) {
    console.error("[GET_SIMILAR_ERROR]", error);
    return NextResponse.json(
      { success: false, similar: [], error: "Failed to fetch similar listings" },
      { status: 500 }
    );
  }
}
