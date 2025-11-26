/**
 * app/api/site/[slug]/me/realestate/route.ts
 * 
 * GET /api/site/[slug]/me/realestate
 * Returns user's real estate listings for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserRealEstate } from "@/lib/db";
import { mapToRealEstateDTO, RealEstateListDTO } from "@/types/dto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    const filters = {
      status: searchParams.get("status") || undefined,
      propertyType: searchParams.get("propertyType") || undefined,
      limit: parseInt(searchParams.get("limit") || "20"),
      cursor: searchParams.get("cursor") || undefined,
      sort: (searchParams.get("sort") || "desc") as "asc" | "desc",
    };

    const listings = await getUserRealEstate(userId, slug, filters);
    
    const listingDTOs = listings.map(mapToRealEstateDTO);
    
    const response: RealEstateListDTO = {
      items: listingDTOs,
      nextCursor: listings.length === filters.limit ? listings[listings.length - 1]?.id || null : null,
      total: listingDTOs.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user real estate listings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
