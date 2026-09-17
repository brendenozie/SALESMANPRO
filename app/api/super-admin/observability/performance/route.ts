/**
 * app/api/super-admin/observability/performance/route.ts
 *
 * Application Performance Monitoring (APM) API.
 * Returns response latency percentiles, slowest routes, and detailed request waterfalls.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import prisma from "@/server/db/prismadb";

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
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    // Fetch slowest individual requests
    const slowRequests = await prisma.monitoringRequest.findMany({
      where: { isSlow: true },
      orderBy: { durationMs: "desc" },
      take: limit,
      select: {
        id: true,
        requestId: true,
        timestamp: true,
        method: true,
        route: true,
        hostname: true,
        tenantId: true,
        statusCode: true,
        durationMs: true,
        authDurationMs: true,
        dbDurationMs: true,
        externalDurationMs: true,
        isSlow: true,
        isError: true,
        errorMessage: true,
        userRole: true,
        serverId: true,
      },
    });

    // Slowest API routes aggregated
    const slowRoutes = await prisma.monitoringRequest.groupBy({
      by: ["route"],
      where: { isSlow: true },
      _count: { route: true },
      _avg: { durationMs: true, dbDurationMs: true, authDurationMs: true },
      _max: { durationMs: true },
      orderBy: { _avg: { durationMs: "desc" } },
      take: 15,
    });

    return NextResponse.json({
      success: true,
      data: {
        slowRequests: slowRequests.map((r) => ({
          ...r,
          timestamp: r.timestamp.toISOString(),
        })),
        slowRoutes: slowRoutes.map((sr) => ({
          route: sr.route,
          count: sr._count.route,
          avgDurationMs: Math.round((sr._avg.durationMs || 0) * 10) / 10,
          maxDurationMs: Math.round((sr._max.durationMs || 0) * 10) / 10,
          avgDbMs: Math.round((sr._avg.dbDurationMs || 0) * 10) / 10,
          avgAuthMs: Math.round((sr._avg.authDurationMs || 0) * 10) / 10,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch APM data" },
      { status: 500 },
    );
  }
}
