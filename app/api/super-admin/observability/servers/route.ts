/**
 * app/api/super-admin/observability/servers/route.ts
 *
 * Infrastructure Server Fleet & Node Resource Telemetry API.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import prisma from "@/server/db/prismadb";
import { collectServerMetrics, syncServerHeartbeat } from "@/lib/observability/serverCollector";

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
    // 1. Refresh local server heartbeat
    await syncServerHeartbeat().catch(() => {});

    // 2. Fetch all registered cluster nodes from database
    const servers = await prisma.monitoringServer.findMany({
      orderBy: { serverId: "asc" },
    });

    // If database has no servers registered yet, report the local server directly
    let serverList = servers;
    if (serverList.length === 0) {
      const local = await collectServerMetrics();
      serverList = [
        {
          id: "local",
          serverId: local.serverId,
          name: local.name,
          hostname: local.hostname,
          ipAddress: null,
          environment: local.environment,
          region: local.region,
          role: local.role as any,
          status: local.status as any,
          version: "2.5.0",
          uptimeSeconds: local.uptimeSeconds,
          cpuUsagePercent: local.cpuUsagePercent,
          memoryTotalBytes: local.memoryTotalBytes,
          memoryUsedBytes: local.memoryUsedBytes,
          swapTotalBytes: 0,
          swapUsedBytes: 0,
          diskTotalBytes: local.diskTotalBytes,
          diskUsedBytes: local.diskUsedBytes,
          loadAvg1m: local.loadAvg1m,
          loadAvg5m: local.loadAvg5m,
          loadAvg15m: local.loadAvg15m,
          eventLoopLagMs: local.eventLoopLagMs,
          heapUsedBytes: local.heapUsedBytes,
          pm2ProcessCount: local.pm2ProcessCount,
          activeServices: local.activeServices,
          metadata: null,
          lastHeartbeatAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }

    // Get current local process details
    const localMetrics = await collectServerMetrics().catch(() => null);

    return NextResponse.json({
      success: true,
      data: {
        servers: serverList.map((s) => ({
          ...s,
          lastHeartbeatAt: s.lastHeartbeatAt.toISOString(),
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        })),
        localDetails: localMetrics,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch server telemetry" },
      { status: 500 },
    );
  }
}
