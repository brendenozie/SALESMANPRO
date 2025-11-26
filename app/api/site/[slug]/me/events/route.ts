/**
 * app/api/site/[slug]/me/events/route.ts
 * 
 * GET /api/site/[slug]/me/events
 * Returns user's events for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserEvents } from "@/lib/db";
import { mapToEventDTO, EventListDTO } from "@/types/dto";

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
      upcoming: searchParams.get("upcoming") === "true",
      limit: parseInt(searchParams.get("limit") || "20"),
      cursor: searchParams.get("cursor") || undefined,
      sort: (searchParams.get("sort") || "desc") as "asc" | "desc",
    };

    const events = await getUserEvents(userId, slug, filters);
    
    const eventDTOs = events.map(mapToEventDTO);
    
    const response: EventListDTO = {
      items: eventDTOs,
      nextCursor: events.length === filters.limit ? events[events.length - 1]?.id || null : null,
      total: eventDTOs.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
