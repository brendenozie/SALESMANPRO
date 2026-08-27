/**
 * app/api/site/[slug]/me/automotive/route.ts
 * 
 * GET /api/site/[slug]/me/automotive
 * Returns user's automotive listings for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserAutomotive } from "@/lib/db";
import { mapToAutomotiveDTO, AutomotiveListDTO } from "@/types/dto";

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
      make: searchParams.get("make") || undefined,
      model: searchParams.get("model") || undefined,
      year: searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined,
      limit: parseInt(searchParams.get("limit") || "20"),
      cursor: searchParams.get("cursor") || undefined,
      sort: (searchParams.get("sort") || "desc") as "asc" | "desc",
    };

    const listings = await getUserAutomotive(userId, slug, filters);
    
    const listingDTOs = listings.map(mapToAutomotiveDTO);
    
    const response: AutomotiveListDTO = {
      items: listingDTOs,
      nextCursor: listings.length === filters.limit ? listings[listings.length - 1]?.id || null : null,
      total: listingDTOs.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user automotive listings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
