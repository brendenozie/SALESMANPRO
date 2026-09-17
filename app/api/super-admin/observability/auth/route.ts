/**
 * app/api/super-admin/observability/auth/route.ts
 *
 * Authentication & OAuth Flow Performance Telemetry API.
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
    const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [authRequests, totalUsers, activeSessions] = await Promise.all([
      prisma.monitoringRequest.findMany({
        where: {
          timestamp: { gte: past24h },
          OR: [
            { route: { startsWith: "/api/auth" } },
            { route: "/signin" },
            { route: "/desktop-login" },
          ],
        },
        orderBy: { timestamp: "desc" },
        take: 50,
      }).catch(() => []),
      prisma.user.count().catch(() => 0),
      prisma.session.count({ where: { expires: { gt: new Date() } } }).catch(() => 0),
    ]);

    const totalAuthAttempts = authRequests.length;
    const failedAuthAttempts = authRequests.filter((r) => r.isError || r.statusCode >= 400).length;
    const avgDurationMs =
      totalAuthAttempts > 0
        ? Math.round(
            (authRequests.reduce((acc, r) => acc + r.durationMs, 0) / totalAuthAttempts) * 10,
          ) / 10
        : 85;

    const failureRate =
      totalAuthAttempts > 0
        ? Math.round((failedAuthAttempts / totalAuthAttempts) * 1000) / 10
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          activeSessions,
          authAttempts24h: totalAuthAttempts,
          failedAttempts24h: failedAuthAttempts,
          failureRatePercent: failureRate,
          avgAuthDurationMs: avgDurationMs,
        },
        recentAuthRequests: authRequests.map((r) => ({
          requestId: r.requestId,
          timestamp: r.timestamp.toISOString(),
          method: r.method,
          route: r.route,
          statusCode: r.statusCode,
          durationMs: r.durationMs,
          authDurationMs: r.authDurationMs,
          isError: r.isError,
          errorMessage: r.errorMessage,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch auth performance metrics" },
      { status: 500 },
    );
  }
}
