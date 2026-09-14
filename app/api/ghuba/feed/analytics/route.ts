/**
 * app/api/ghuba/feed/analytics/route.ts
 *
 * POST /api/ghuba/feed/analytics
 * Batched, asynchronous ingest for feed impressions, watch time milestones,
 * and user interactions.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";

interface FeedEvent {
  type:
    | "FEED_IMPRESSION"
    | "MEDIA_PLAY"
    | "MEDIA_25"
    | "MEDIA_50"
    | "MEDIA_75"
    | "MEDIA_COMPLETE"
    | "MEDIA_ERROR"
    | "MEDIA_STARTUP_LATENCY"
    | "IMAGE_LOAD_LATENCY"
    | "LISTING_OPEN"
    | "LIKE"
    | "COMMENT"
    | "SHARE"
    | "SAVE"
    | "ADD_TO_CART"
    | "BUY_NOW"
    | "BOOK"
    | "CONTACT";
  listingId: string;
  durationMs?: number;
  timestamp?: number;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || null;

    const body = await request.json().catch(() => ({}));
    const rawEvents: FeedEvent[] = Array.isArray(body?.events)
      ? body.events
      : body?.type && body?.listingId
      ? [body]
      : [];

    if (rawEvents.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    // Sanitize events
    const validEvents = rawEvents
      .filter((e) => e && typeof e.listingId === "string" && typeof e.type === "string")
      .slice(0, 50); // Cap batch at 50

    // Record UserActivity asynchronously if user is signed in
    if (userId && validEvents.length > 0) {
      const activities = validEvents.map((event) => ({
        userId,
        marketplaceListingId: /^[0-9a-fA-F]{24}$/.test(event.listingId)
          ? event.listingId
          : undefined,
        activityType: `FEED_${event.type}`,
        details: {
          durationMs: event.durationMs || 0,
          metadata: event.metadata || {},
          clientTimestamp: event.timestamp || Date.now(),
        },
      }));

      // Fire-and-forget database writes without blocking
      prisma.userActivity.createMany({ data: activities }).catch((err) => {
        console.warn("[ANALYTICS_USER_ACTIVITY_WARN]", err.message);
      });
    }

    return NextResponse.json({ success: true, processed: validEvents.length });
  } catch (error: any) {
    console.warn("[ANALYTICS_INGEST_WARN]", error?.message);
    return NextResponse.json({ success: false, error: error?.message }, { status: 200 });
  }
}
