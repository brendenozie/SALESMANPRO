/**
 * app/api/ai/usage/route.ts
 *
 * GET /api/ai/usage
 * Returns usage statistics and telemetry categorized by capability and model.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { creditLedger } from "@/lib/ai/creditLedger";

export async function GET(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const { searchParams } = new URL(req.url);
    const timeframe = (searchParams.get("timeframe") || "month") as "day" | "week" | "month" | "all";

    const data = await creditLedger.getUsageAnalytics({
      companyId: auth.companyId,
      timeframe,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error("[GET_AI_USAGE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch AI usage" },
      { status: error.statusCode || 500 },
    );
  }
}
