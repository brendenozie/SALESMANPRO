/**
 * app/api/ai/workforce/cron/briefing/route.ts
 *
 * Scheduled Cron Trigger Endpoint for Store Manager Daily Briefing.
 * Scheduled for 07:00 EAT (04:00 UTC).
 * Supports standard Authorization header (Bearer token) or CRON_SECRET check.
 */

import { NextRequest, NextResponse } from "next/server";
import { triggerDailyStoreBriefings } from "@/lib/ai/workforce/scheduler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Validate cron secret if configured in environment
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const urlKey = new URL(req.url).searchParams.get("key");
      if (urlKey !== cronSecret) {
        return NextResponse.json({ success: false, error: "Unauthorized cron invocation." }, { status: 401 });
      }
    }

    const result = await triggerDailyStoreBriefings();

    return NextResponse.json({
      success: true,
      message: "Daily briefings generation completed.",
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error: any) {
    console.error("[CRON_BRIEFING_ENDPOINT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run daily briefings cron" },
      { status: 500 },
    );
  }
}
