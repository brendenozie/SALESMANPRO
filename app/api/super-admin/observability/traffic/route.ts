/**
 * app/api/super-admin/observability/traffic/route.ts
 *
 * Real-time and historical web traffic telemetry API.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import prisma from "@/server/db/prismadb";
import { getLiveTrafficSummary } from "@/lib/observability/tracker";

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
    const liveSummary = getLiveTrafficSummary();

    // Fetch 24-hour request statistics from DB
    const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [total24h, slow24h, error24h] = await Promise.all([
      prisma.monitoringRequest.count({ where: { timestamp: { gte: past24h } } }).catch(() => 0),
      prisma.monitoringRequest.count({ where: { timestamp: { gte: past24h }, isSlow: true } }).catch(() => 0),
      prisma.monitoringRequest.count({ where: { timestamp: { gte: past24h }, isError: true } }).catch(() => 0),
    ]);

    // Top routes over 24h
    const topRoutes24h = await prisma.monitoringRequest.groupBy({
      by: ["route"],
      where: { timestamp: { gte: past24h } },
      _count: { route: true },
      _avg: { durationMs: true },
      orderBy: { _count: { route: "desc" } },
      take: 12,
    }).catch(() => []);

    return NextResponse.json({
      success: true,
      data: {
        live: liveSummary,
        historical24h: {
          totalRequests: total24h,
          slowRequests: slow24h,
          errorRequests: error24h,
          topRoutes: topRoutes24h.map((r) => ({
            route: r.route,
            count: r._count.route,
            avgDurationMs: Math.round((r._avg.durationMs || 0) * 10) / 10,
          })),
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch traffic metrics" },
      { status: 500 },
    );
  }
}
