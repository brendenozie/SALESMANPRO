/**
 * workers/observability-worker.ts
 *
 * Dedicated Observability & Health Telemetry Worker.
 * Periodically reports server heartbeats, collects resource metrics, evaluates
 * alert rules, checks queue backlogs, and executes data retention rollups.
 */

import { syncServerHeartbeat } from "../lib/observability/serverCollector";
import { getDatabaseHealth } from "../lib/observability/dbMonitor";
import { getRedisHealth } from "../lib/observability/redisMonitor";
import { getAllQueueStatuses } from "../lib/observability/queueMonitor";
import { evaluateAlertRules } from "../lib/observability/alertEngine";
import { flushPendingWrites, getLiveTrafficSummary } from "../lib/observability/tracker";
import { runRetentionCleanup } from "../lib/observability/retention";

const HEARTBEAT_INTERVAL_MS = 20000; // 20 seconds
const RETENTION_INTERVAL_MS = 3600000; // 1 hour

let isRunning = true;
let lastRetentionRun = 0;

async function runObservabilityCycle(): Promise<void> {
  try {
    // 1. Sync server heartbeat & resource telemetry
    const server = await syncServerHeartbeat();

    // 2. Inspect Database & Redis
    const [db, redis, queues] = await Promise.all([
      getDatabaseHealth().catch(() => null),
      getRedisHealth().catch(() => null),
      getAllQueueStatuses().catch(() => []),
    ]);

    // 3. Flush any buffered request telemetry
    await flushPendingWrites().catch(() => {});

    // 4. Calculate total waiting jobs across all queues
    const totalQueueWaiting = (queues as any[]).reduce((sum: number, q: any) => sum + (q.waiting || 0), 0);
    const traffic = getLiveTrafficSummary();

    // 5. Evaluate alert rules
    await evaluateAlertRules({
      cpu_percent: server.cpuUsagePercent,
      memory_percent: server.memoryUsagePercent,
      disk_percent: server.diskUsagePercent,
      error_rate: traffic.errorRatePercent,
      p95_latency: traffic.p95LatencyMs,
      db_latency: db?.pingLatencyMs || 0,
      queue_backlog: totalQueueWaiting,
    }).catch(() => {});

    // 6. Run retention cleanup every hour
    const now = Date.now();
    if (now - lastRetentionRun > RETENTION_INTERVAL_MS) {
      lastRetentionRun = now;
      await runRetentionCleanup().catch(() => {});
    }
  } catch (err: any) {
    console.warn("[ObservabilityWorker] Cycle warning:", err.message);
  }
}

async function startWorker() {
  console.log(`[ObservabilityWorker] Starting telemetry agent for server: ${process.env.SERVER_ID || "server-01"}`);

  // Initial execution immediately on startup
  await runObservabilityCycle();

  while (isRunning) {
    await new Promise((resolve) => setTimeout(resolve, HEARTBEAT_INTERVAL_MS));
    if (!isRunning) break;
    await runObservabilityCycle();
  }

  console.log("[ObservabilityWorker] Worker gracefully stopped.");
}

// Graceful shutdown handlers
process.on("SIGINT", () => {
  console.log("[ObservabilityWorker] Received SIGINT. Shutting down...");
  isRunning = false;
});

process.on("SIGTERM", () => {
  console.log("[ObservabilityWorker] Received SIGTERM. Shutting down...");
  isRunning = false;
});

// Run
startWorker().catch((err) => {
  console.error("[ObservabilityWorker] Fatal error starting worker:", err);
  process.exit(1);
});
