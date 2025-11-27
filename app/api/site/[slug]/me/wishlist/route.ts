/**
 * app/api/site/[slug]/me/wishlist/route.ts
 * 
 * GET /api/site/[slug]/me/wishlist
 * Returns user's wishlist for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserWishlist } from "@/lib/db";
import { mapToWishlistItemDTO, WishlistListDTO } from "@/types/dto";

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
      limit: parseInt(searchParams.get("limit") || "20"),
      cursor: searchParams.get("cursor") || undefined,
      sort: (searchParams.get("sort") || "desc") as "asc" | "desc",
    };

    const wishlist = await getUserWishlist(userId, slug, filters);
    
    const wishlistDTOs = wishlist.map(mapToWishlistItemDTO);
    
    const response: WishlistListDTO = {
      items: wishlistDTOs,
      nextCursor: wishlist.length === filters.limit ? wishlist[wishlist.length - 1]?.id || null : null,
      total: wishlistDTOs.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
