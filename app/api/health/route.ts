/**
 * app/api/health/route.ts
 *
 * Comprehensive Health Check Probes for Single-Server PM2 and Multi-Server Load Balancers.
 *
 * Endpoints:
 * - GET /api/health                   -> Full platform health summary
 * - GET /api/health?type=liveness    -> Lightweight 200 OK process alive probe
 * - GET /api/health?type=readiness   -> Validates MongoDB & Redis connectivity
 * - GET /api/health?type=dependencies-> Probes external integrations (OAuth, M-Pesa, Stripe)
 * - GET /api/health?type=version     -> Application release, node version, server ID & role
 */

import { NextResponse } from "next/server";
import { getDatabaseHealth } from "@/lib/observability/dbMonitor";
import { getRedisHealth } from "@/lib/observability/redisMonitor";
import { collectServerMetrics } from "@/lib/observability/serverCollector";
import { probeExternalServices } from "@/lib/observability/serviceMonitor";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const serverId = process.env.SERVER_ID || "server-01";
  const serverRole = process.env.SERVER_ROLE || "ALL_IN_ONE";

  // 1. Lightweight Liveness Probe - verifies HTTP event loop is alive
  if (type === "liveness" || type === "live") {
    return NextResponse.json(
      {
        status: "ALIVE",
        timestamp: new Date().toISOString(),
        serverId,
        uptimeSeconds: Math.floor(process.uptime()),
      },
      { status: 200 },
    );
  }

  // 2. Version and Build Probe
  if (type === "version") {
    return NextResponse.json({
      status: "OK",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "2.5.0",
      environment: process.env.NODE_ENV || "production",
      serverId,
      serverRole,
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }

  // 3. External Dependencies Probe
  if (type === "dependencies") {
    const deps = await probeExternalServices();
    const hasFailures = deps.some((d) => !d.isAvailable);
    return NextResponse.json(
      {
        status: hasFailures ? "DEGRADED" : "HEALTHY",
        timestamp: new Date().toISOString(),
        serverId,
        dependencies: deps,
      },
      { status: hasFailures ? 207 : 200 },
    );
  }

  // 4. Readiness Probe or Full Health Summary
  const [db, redis] = await Promise.all([
    getDatabaseHealth(),
    getRedisHealth(),
  ]);

  const mongoOk = db.status !== "OFFLINE";
  const redisOk = redis.status !== "DISCONNECTED";
  const isReady = mongoOk; // MongoDB is strictly required for serving production traffic

  if (type === "readiness" || type === "ready") {
    return NextResponse.json(
      {
        status: isReady ? "READY" : "NOT_READY",
        timestamp: new Date().toISOString(),
        serverId,
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
          status: db.status,
          latencyMs: db.pingLatencyMs,
        },
        redis: {
          status: redis.status,
          latencyMs: redis.pingLatencyMs,
        },
      },
      { status: isReady ? 200 : 503 },
    );
  }

  // Full Health Report
  const server = await collectServerMetrics().catch(() => null);
  const overallHealth = !mongoOk
    ? "CRITICAL"
    : (!redisOk || (server && server.status === "DEGRADED"))
    ? "DEGRADED"
    : (server && server.status === "WARNING")
    ? "WARNING"
    : "HEALTHY";

  const httpStatus = overallHealth === "CRITICAL" ? 503 : 200;

  return NextResponse.json(
    {
      status: overallHealth,
      timestamp: new Date().toISOString(),
      serverId,
      serverRole,
      uptimeSeconds: Math.floor(process.uptime()),
      services: {
        mongodb: {
          status: db.status,
          latencyMs: db.pingLatencyMs,
          totalCollections: db.totalCollections,
          lastSuccessfulBackup: db.lastSuccessfulBackup?.createdAt || null,
        },
        redis: {
          status: redis.status,
          latencyMs: redis.pingLatencyMs,
          memoryUsedHuman: redis.memoryUsedHuman,
          connectedClients: redis.connectedClients,
        },
        server: server
          ? {
              status: server.status,
              cpuUsagePercent: server.cpuUsagePercent,
              memoryUsagePercent: server.memoryUsagePercent,
              diskUsagePercent: server.diskUsagePercent,
              loadAvg1m: server.loadAvg1m,
              eventLoopLagMs: server.eventLoopLagMs,
            }
          : null,
      },
    },
    { status: httpStatus },
  );
}
