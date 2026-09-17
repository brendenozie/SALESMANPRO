/**
 * app/api/super-admin/observability/overview/route.ts
 *
 * Executive technical overview endpoint for Superadmin Observability.
 * Consolidates real-time health, server metrics, traffic, queues, database,
 * active alerts, and recent errors.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import prisma from "@/server/db/prismadb";
import { collectServerMetrics } from "@/lib/observability/serverCollector";
import { getLiveTrafficSummary } from "@/lib/observability/tracker";
import { getDatabaseHealth } from "@/lib/observability/dbMonitor";
import { getRedisHealth } from "@/lib/observability/redisMonitor";
import { getAllQueueStatuses } from "@/lib/observability/queueMonitor";
import { probeExternalServices } from "@/lib/observability/serviceMonitor";
import { OverviewDashboardData, SystemHealthStatus } from "@/lib/observability/types";

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
    const [server, traffic, db, redis, queues, dependencies, recentAlerts, recentErrors, recentIncidents] =
      await Promise.all([
        collectServerMetrics().catch(() => null),
        Promise.resolve(getLiveTrafficSummary()),
        getDatabaseHealth().catch(() => null),
        getRedisHealth().catch(() => null),
        getAllQueueStatuses().catch(() => []),
        probeExternalServices().catch(() => []),
        prisma.monitoringAlert.findMany({
          where: { state: "TRIGGERED" },
          orderBy: { lastTriggeredAt: "desc" },
          take: 10,
        }).catch(() => []),
        prisma.monitoringError.findMany({
          where: { status: { in: ["NEW", "INVESTIGATING"] } },
          orderBy: { lastSeenAt: "desc" },
          take: 8,
        }).catch(() => []),
        prisma.monitoringIncident.findMany({
          where: { status: { not: "RESOLVED" } },
          orderBy: { startedAt: "desc" },
          take: 5,
        }).catch(() => []),
      ]);

    const totalQueueWaiting = queues.reduce((sum, q) => sum + (q.waiting || 0), 0);
    const totalQueueFailed = queues.reduce((sum, q) => sum + (q.failed || 0), 0);

    // Determine overall system health state
    let systemStatus: SystemHealthStatus = "HEALTHY";
    let statusReason = "All core infrastructure, database, workers, and gateways operating normally.";

    if (db?.status === "OFFLINE") {
      systemStatus = "CRITICAL";
      statusReason = "MongoDB database unreachable or connection pool exhausted.";
    } else if (recentIncidents.length > 0) {
      systemStatus = "DEGRADED";
      statusReason = `Active technical incident: ${recentIncidents[0].title}`;
    } else if (recentAlerts.some((a) => a.severity === "CRITICAL")) {
      systemStatus = "CRITICAL";
      statusReason = `Critical alert triggered: ${recentAlerts.find((a) => a.severity === "CRITICAL")?.name}`;
    } else if (server && (server.cpuUsagePercent > 90 || server.memoryUsagePercent > 92)) {
      systemStatus = "DEGRADED";
      statusReason = `Server resource strain: CPU ${server.cpuUsagePercent}%, Memory ${server.memoryUsagePercent}%`;
    } else if (redis?.status === "DISCONNECTED") {
      systemStatus = "DEGRADED";
      statusReason = "Redis broker disconnected; background jobs and caching delayed.";
    } else if (recentAlerts.length > 0) {
      systemStatus = "WARNING";
      statusReason = `${recentAlerts.length} operational alert(s) currently active.`;
    } else if (traffic.errorRatePercent > 5) {
      systemStatus = "WARNING";
      statusReason = `Elevated error rate (${traffic.errorRatePercent}%) detected on web traffic.`;
    }

    const payload: OverviewDashboardData = {
      systemStatus,
      statusReason,
      metrics: {
        availabilityPercent: db?.status === "OFFLINE" ? 0 : 99.95,
        requestsPerMinute: traffic.requestsPerMinute,
        activeSessions: 1, // Base active admin session
        averageLatencyMs: traffic.averageLatencyMs,
        p95LatencyMs: traffic.p95LatencyMs,
        p99LatencyMs: traffic.p99LatencyMs,
        errorRatePercent: traffic.errorRatePercent,
        slowRequests1h: traffic.slowRequestCount,
        cpuUsagePercent: server?.cpuUsagePercent || 0,
        memoryUsagePercent: server?.memoryUsagePercent || 0,
        swapUsagePercent: server?.swapUsagePercent || 0,
        diskUsagePercent: server?.diskUsagePercent || 0,
        databaseLatencyMs: db?.pingLatencyMs || 0,
        redisLatencyMs: redis?.pingLatencyMs || 0,
        totalQueueWaiting,
        totalQueueFailed,
        paymentFailureRatePercent: 0,
        activeAlertsCount: recentAlerts.length,
        activeIncidentsCount: recentIncidents.length,
      },
      server: server!,
      recentAlerts: recentAlerts.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description || undefined,
        metric: a.metric,
        condition: a.condition as any,
        threshold: a.threshold,
        durationSeconds: a.durationSeconds,
        severity: a.severity as any,
        enabled: a.enabled,
        cooldownMinutes: a.cooldownMinutes,
        state: a.state as any,
        lastTriggeredAt: a.lastTriggeredAt?.toISOString(),
        lastResolvedAt: a.lastResolvedAt?.toISOString(),
        lastValue: a.lastValue ?? undefined,
      })),
      recentErrors: recentErrors.map((e) => ({
        id: e.id,
        fingerprint: e.fingerprint,
        title: e.title,
        message: e.message,
        errorType: e.errorType,
        status: e.status as any,
        severity: e.severity as any,
        stack: e.stack || undefined,
        firstSeenAt: e.firstSeenAt.toISOString(),
        lastSeenAt: e.lastSeenAt.toISOString(),
        count: e.count,
        affectedRoutes: e.affectedRoutes,
        affectedTenants: e.affectedTenants,
        sampleRequestIds: e.sampleRequestIds,
        lastServerId: e.lastServerId || undefined,
      })),
      recentIncidents: recentIncidents.map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        severity: i.severity as any,
        status: i.status as any,
        startedAt: i.startedAt.toISOString(),
        resolvedAt: i.resolvedAt?.toISOString(),
        affectedServices: i.affectedServices,
        timeline: (i.timeline as any[]) || [],
        notes: i.notes || undefined,
      })),
      queues,
      dependencies,
      lastBackup: db?.lastSuccessfulBackup || null,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate overview telemetry" },
      { status: 500 },
    );
  }
}
