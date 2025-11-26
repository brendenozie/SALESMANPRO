/**
 * app/api/site/[slug]/me/nonprofit/route.ts
 * 
 * GET /api/site/[slug]/me/nonprofit
 * Returns user's nonprofit contributions for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserNonprofit } from "@/lib/db";
import { mapToNonprofitContributionDTO, NonprofitListDTO } from "@/types/dto";

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

    const contributions = await getUserNonprofit(userId, slug, filters);
    
    const contributionDTOs = contributions.map(mapToNonprofitContributionDTO);
    
    // Calculate total donations
    const totalDonations = contributionDTOs.reduce((sum, c) => sum + c.amount, 0);
    
    const response: NonprofitListDTO = {
      items: contributionDTOs,
      nextCursor: contributions.length === filters.limit ? contributions[contributions.length - 1]?.id || null : null,
      total: contributionDTOs.length,
      totalDonations,
      hoursVolunteered: 0, // Would need additional tracking
      treesPlanted: 0, // Would need additional tracking
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user nonprofit contributions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
