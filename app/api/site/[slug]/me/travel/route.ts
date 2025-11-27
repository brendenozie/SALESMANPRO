/**
 * app/api/site/[slug]/me/travel/route.ts
 * 
 * GET /api/site/[slug]/me/travel
 * Returns user's travel bookings for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserTravel } from "@/lib/db";
import { mapToTravelBookingDTO, TravelListDTO } from "@/types/dto";

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

    const bookings = await getUserTravel(userId, slug, filters);
    
    const bookingDTOs = bookings.map(mapToTravelBookingDTO);
    
    const response: TravelListDTO = {
      items: bookingDTOs,
      nextCursor: bookings.length === filters.limit ? bookings[bookings.length - 1]?.id || null : null,
      total: bookingDTOs.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user travel bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
