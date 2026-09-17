/**
 * app/api/admin/ghuba/search-analytics/route.ts
 *
 * Administrator Analytics Endpoint for Ghuba Marketplace Search Intelligence.
 * Returns query demand, top searched terms, zero-result searches, and category trends.
 */

import { NextResponse } from "next/server";
import { SearchAnalyticsService } from "@/lib/search/searchAnalyticsService";
import { verifyAuth } from "@/lib/verifyAuth";

export async function GET(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authorized || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (authResult.user.role || "").toUpperCase();
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const analytics = await SearchAnalyticsService.getSearchAnalytics({ days });

    return NextResponse.json(analytics, { status: 200 });
  } catch (error: any) {
    console.error("[API/admin/ghuba/search-analytics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch search analytics", details: error.message },
      { status: 500 }
    );
  }
}
