/**
 * app/api/ghuba/feed/route.ts
 *
 * GET /api/ghuba/feed
 * Returns cursor-paginated, ranked marketplace feed items with media priority,
 * engagement counters, and session viewer state.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getGhubaFeed, FeedListingType } from "@/lib/ghuba-feed-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || null;

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const category = searchParams.get("category");
    const rawType = searchParams.get("type");

    const validTypes: FeedListingType[] = ["ECOMMERCE", "SERVICE", "PROPERTY", "AUTO"];
    const type = rawType && validTypes.includes(rawType.toUpperCase() as FeedListingType)
      ? (rawType.toUpperCase() as FeedListingType)
      : null;

    const feed = await getGhubaFeed({
      cursor,
      limit,
      category,
      type,
      userId,
    });

    const response = NextResponse.json(feed, { status: 200 });

    // When no viewer is authenticated, allow short CDN/proxy caching
    if (!userId) {
      response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    } else {
      response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    }

    return response;
  } catch (error: any) {
    console.error("[GHUBA_FEED_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch marketplace feed", details: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
