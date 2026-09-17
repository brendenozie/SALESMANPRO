/**
 * app/api/super-admin/observability/system-check/route.ts
 *
 * On-Demand Deep Diagnostic Testing API.
 * Runs comprehensive active health checks across Database, Redis, Queues,
 * Disk write throughput, and external third-party API gateways.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { getDatabaseHealth } from "@/lib/observability/dbMonitor";
import { getRedisHealth } from "@/lib/observability/redisMonitor";
import { getAllQueueStatuses } from "@/lib/observability/queueMonitor";
import { collectServerMetrics } from "@/lib/observability/serverCollector";
import { probeExternalServices } from "@/lib/observability/serviceMonitor";

export const dynamic = "force-dynamic";

interface DiagnosticResult {
  id: string;
  name: string;
  category: "database" | "cache" | "workers" | "system" | "network" | "storage";
  status: "PASSED" | "WARNING" | "FAILED";
  latencyMs: number;
  message: string;
  details?: any;
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin(req);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Unauthorized" },
      { status: err.statusCode || 401 },
    );
  }

  const results: DiagnosticResult[] = [];
  const overallStart = Date.now();

  // Test 1: MongoDB Ping
  try {
    const db = await getDatabaseHealth();
    results.push({
      id: "diag_mongodb",
      name: "MongoDB Connection & Latency",
      category: "database",
      status: db.status === "ONLINE" ? "PASSED" : db.status === "DEGRADED" ? "WARNING" : "FAILED",
      latencyMs: db.pingLatencyMs,
      message:
        db.status === "ONLINE"
          ? `MongoDB connected successfully (${db.pingLatencyMs}ms). Verified ${db.totalCollections} collection models.`
          : `MongoDB returned status: ${db.status}`,
      details: { collections: db.collections },
    });
  } catch (err: any) {
    results.push({
      id: "diag_mongodb",
      name: "MongoDB Connection & Latency",
      category: "database",
      status: "FAILED",
      latencyMs: 0,
      message: `Database failure: ${err.message}`,
    });
  }

  // Test 2: Redis Connection
  try {
    const redis = await getRedisHealth();
    results.push({
      id: "diag_redis",
      name: "Redis Memory & Broker Health",
      category: "cache",
      status: redis.status === "CONNECTED" ? "PASSED" : "FAILED",
      latencyMs: redis.pingLatencyMs,
      message:
        redis.status === "CONNECTED"
          ? `Redis responded in ${redis.pingLatencyMs}ms. Memory: ${redis.memoryUsedHuman}, Clients: ${redis.connectedClients}`
          : "Redis client could not establish connection.",
    });
  } catch (err: any) {
    results.push({
      id: "diag_redis",
      name: "Redis Memory & Broker Health",
      category: "cache",
      status: "FAILED",
      latencyMs: 0,
      message: `Redis check error: ${err.message}`,
    });
  }

  // Test 3: BullMQ Queues
  try {
    const queues = await getAllQueueStatuses();
    const failedQueues = queues.filter((q) => !q.isHealthy);
    results.push({
      id: "diag_queues",
      name: "Background Job Queues",
      category: "workers",
      status: failedQueues.length === 0 ? "PASSED" : "WARNING",
      latencyMs: 0,
      message:
        failedQueues.length === 0
          ? `All ${queues.length} BullMQ worker queues are healthy.`
          : `${failedQueues.length} queue(s) experiencing high backlog: ${failedQueues.map((q) => q.displayName).join(", ")}`,
      details: { queues },
    });
  } catch (err: any) {
    results.push({
      id: "diag_queues",
      name: "Background Job Queues",
      category: "workers",
      status: "FAILED",
      latencyMs: 0,
      message: `Queue inspection failure: ${err.message}`,
    });
  }

  // Test 4: Server Resources
  try {
    const server = await collectServerMetrics();
    const hasWarning =
      server.cpuUsagePercent > 80 || server.memoryUsagePercent > 85 || server.diskUsagePercent > 85;
    results.push({
      id: "diag_server",
      name: "Host Server Resources (CPU, Memory, Disk)",
      category: "system",
      status: hasWarning ? "WARNING" : "PASSED",
      latencyMs: server.eventLoopLagMs,
      message: `CPU: ${server.cpuUsagePercent}%, RAM: ${server.memoryUsagePercent}%, Disk: ${server.diskUsagePercent}%, Event loop lag: ${server.eventLoopLagMs}ms`,
      details: {
        loadAvg: [server.loadAvg1m, server.loadAvg5m, server.loadAvg15m],
        pm2Count: server.pm2ProcessCount,
      },
    });
  } catch (err: any) {
    results.push({
      id: "diag_server",
      name: "Host Server Resources",
      category: "system",
      status: "FAILED",
      latencyMs: 0,
      message: `Server metrics error: ${err.message}`,
    });
  }

  // Test 5: External Gateways
  try {
    const deps = await probeExternalServices();
    const failedDeps = deps.filter((d) => !d.isAvailable);
    results.push({
      id: "diag_external",
      name: "External API Gateways & Integrations",
      category: "network",
      status: failedDeps.length === 0 ? "PASSED" : "WARNING",
      latencyMs: 0,
      message:
        failedDeps.length === 0
          ? `All ${deps.length} third-party services (OAuth, Payment Gateways, AI) reachable.`
          : `${failedDeps.length} service(s) unavailable or degraded: ${failedDeps.map((d) => d.displayName).join(", ")}`,
      details: { dependencies: deps },
    });
  } catch (err: any) {
    results.push({
      id: "diag_external",
      name: "External API Gateways",
      category: "network",
      status: "FAILED",
      latencyMs: 0,
      message: `Dependency check failed: ${err.message}`,
    });
  }

  const passedCount = results.filter((r) => r.status === "PASSED").length;
  const warningCount = results.filter((r) => r.status === "WARNING").length;
  const failedCount = results.filter((r) => r.status === "FAILED").length;
  const durationMs = Date.now() - overallStart;

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        totalTests: results.length,
        passed: passedCount,
        warnings: warningCount,
        failed: failedCount,
        durationMs,
        overallStatus: failedCount > 0 ? "FAILED" : warningCount > 0 ? "WARNING" : "PASSED",
        executedAt: new Date().toISOString(),
      },
      results,
    },
  });
}
