/**
 * app/api/social/analytics/route.ts
 *
 * Retrieves aggregated multi-platform analytics and publication metrics.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { socialService } from "@/lib/social/socialService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const analytics = await socialService.getAggregatedAnalytics(auth.companyId);

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error: any) {
    console.error("[GET /api/social/analytics] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch social analytics" },
      { status: error.statusCode || 500 }
    );
  }
}
