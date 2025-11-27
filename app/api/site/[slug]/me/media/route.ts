/**
 * app/api/site/[slug]/me/media/route.ts
 * 
 * GET /api/site/[slug]/me/media
 * Returns user's media assets for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserMedia } from "@/lib/db";
import { mapToMediaItemDTO, MediaListDTO } from "@/types/dto";

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
      type: searchParams.get("type") || undefined,
      limit: parseInt(searchParams.get("limit") || "20"),
      cursor: searchParams.get("cursor") || undefined,
      sort: (searchParams.get("sort") || "desc") as "asc" | "desc",
    };

    const media = await getUserMedia(userId, slug, filters);
    
    const mediaDTOs = media.map(mapToMediaItemDTO);
    
    const response: MediaListDTO = {
      items: mediaDTOs,
      nextCursor: media.length === filters.limit ? media[media.length - 1]?.id || null : null,
      total: mediaDTOs.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
