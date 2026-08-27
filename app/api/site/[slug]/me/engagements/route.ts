/**
 * app/api/site/[slug]/me/engagements/route.ts
 * 
 * GET /api/site/[slug]/me/engagements
 * Returns user's engagements (consultant/speaker) for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserEngagements } from "@/lib/db";
import { mapToEngagementDTO, EngagementListDTO } from "@/types/dto";

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
      limit: parseInt(searchParams.get("limit") || "20"),
      cursor: searchParams.get("cursor") || undefined,
      sort: (searchParams.get("sort") || "desc") as "asc" | "desc",
    };

    const engagements = await getUserEngagements(userId, slug, filters);
    
    const engagementDTOs = engagements.map(mapToEngagementDTO);
    
    const response: EngagementListDTO = {
      items: engagementDTOs,
      nextCursor: engagements.length === filters.limit ? engagements[engagements.length - 1]?.id || null : null,
      total: engagementDTOs.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user engagements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
