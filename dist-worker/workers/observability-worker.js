"use strict";
/**
 * workers/observability-worker.ts
 *
 * Dedicated Observability & Health Telemetry Worker.
 * Periodically reports server heartbeats, collects resource metrics, evaluates
 * alert rules, checks queue backlogs, and executes data retention rollups.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const serverCollector_1 = require("../lib/observability/serverCollector");
const dbMonitor_1 = require("../lib/observability/dbMonitor");
const redisMonitor_1 = require("../lib/observability/redisMonitor");
const queueMonitor_1 = require("../lib/observability/queueMonitor");
const alertEngine_1 = require("../lib/observability/alertEngine");
const tracker_1 = require("../lib/observability/tracker");
const retention_1 = require("../lib/observability/retention");
const HEARTBEAT_INTERVAL_MS = 20000; // 20 seconds
const RETENTION_INTERVAL_MS = 3600000; // 1 hour
let isRunning = true;
let lastRetentionRun = 0;
async function runObservabilityCycle() {
    try {
        // 1. Sync server heartbeat & resource telemetry
        const server = await (0, serverCollector_1.syncServerHeartbeat)();
        // 2. Inspect Database & Redis
        const [db, redis, queues] = await Promise.all([
            (0, dbMonitor_1.getDatabaseHealth)().catch(() => null),
            (0, redisMonitor_1.getRedisHealth)().catch(() => null),
            (0, queueMonitor_1.getAllQueueStatuses)().catch(() => []),
        ]);
        // 3. Flush any buffered request telemetry
        await (0, tracker_1.flushPendingWrites)().catch(() => { });
        // 4. Calculate total waiting jobs across all queues
        const totalQueueWaiting = queues.reduce((sum, q) => sum + (q.waiting || 0), 0);
        const traffic = (0, tracker_1.getLiveTrafficSummary)();
        // 5. Evaluate alert rules
        await (0, alertEngine_1.evaluateAlertRules)({
            cpu_percent: server.cpuUsagePercent,
            memory_percent: server.memoryUsagePercent,
            disk_percent: server.diskUsagePercent,
            error_rate: traffic.errorRatePercent,
            p95_latency: traffic.p95LatencyMs,
            db_latency: db?.pingLatencyMs || 0,
            queue_backlog: totalQueueWaiting,
        }).catch(() => { });
        // 6. Run retention cleanup every hour
        const now = Date.now();
        if (now - lastRetentionRun > RETENTION_INTERVAL_MS) {
            lastRetentionRun = now;
            await (0, retention_1.runRetentionCleanup)().catch(() => { });
        }
    }
    catch (err) {
        console.warn("[ObservabilityWorker] Cycle warning:", err.message);
    }
}
async function startWorker() {
    console.log(`[ObservabilityWorker] Starting telemetry agent for server: ${process.env.SERVER_ID || "server-01"}`);
    // Initial execution immediately on startup
    await runObservabilityCycle();
    while (isRunning) {
        await new Promise((resolve) => setTimeout(resolve, HEARTBEAT_INTERVAL_MS));
        if (!isRunning)
            break;
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
