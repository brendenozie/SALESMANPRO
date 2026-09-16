"use strict";
/**
 * workers/analytics-worker.ts
 *
 * Standalone worker process for aggregating interaction telemetry events.
 * Runs alongside the other workers in production (via PM2).
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("./resolve-alias");
const analyticsWorker_1 = require("@/lib/analytics/queue/analyticsWorker");
console.log("🚀 Starting SalesmanPro Analytics Aggregation Worker...");
const worker = (0, analyticsWorker_1.createAnalyticsWorker)();
if (worker) {
    console.log("✅ SalesmanPro Analytics Aggregation Worker running and listening for jobs.");
    process.on("unhandledRejection", (reason) => {
        console.error("⚠️ [ANALYTICS_WORKER] Unhandled Rejection:", reason?.message || reason);
    });
    process.on("uncaughtException", (error) => {
        console.error("🚨 [ANALYTICS_WORKER] Uncaught Exception:", error.message);
        setTimeout(() => process.exit(1), 5000);
    });
    const shutdown = async (signal) => {
        console.log(`\n🛑 Received ${signal}. Shutting down Analytics Worker gracefully...`);
        try {
            await worker.close();
            console.log("✅ Analytics Worker closed.");
            process.exit(0);
        }
        catch (error) {
            console.error("❌ Error during worker shutdown:", error);
            process.exit(1);
        }
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
}
else {
    console.log("ℹ️ Analytics worker skipped (Redis not connected).");
}
