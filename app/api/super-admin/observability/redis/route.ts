/**
 * app/api/super-admin/observability/redis/route.ts
 *
 * Redis Memory, Cache & Broker Telemetry API.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { getRedisHealth } from "@/lib/observability/redisMonitor";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Unauthorized" },
      { status: err.statusCode || 401 },
    );
  }

  try {
    const health = await getRedisHealth();
    return NextResponse.json({ success: true, data: health });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch Redis health" },
      { status: 500 },
    );
  }
}
