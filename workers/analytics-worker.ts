/**
 * workers/analytics-worker.ts
 *
 * Standalone worker process for aggregating interaction telemetry events.
 * Runs alongside the other workers in production (via PM2).
 */

import "./resolve-alias";
import { createAnalyticsWorker } from "@/lib/analytics/queue/analyticsWorker";

console.log("🚀 Starting SalesmanPro Analytics Aggregation Worker...");

const worker = createAnalyticsWorker();

if (worker) {
  console.log("✅ SalesmanPro Analytics Aggregation Worker running and listening for jobs.");

  process.on("unhandledRejection", (reason: any) => {
    console.error("⚠️ [ANALYTICS_WORKER] Unhandled Rejection:", reason?.message || reason);
  });

  process.on("uncaughtException", (error: Error) => {
    console.error("🚨 [ANALYTICS_WORKER] Uncaught Exception:", error.message);
    setTimeout(() => process.exit(1), 5000);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down Analytics Worker gracefully...`);
    try {
      await worker.close();
      console.log("✅ Analytics Worker closed.");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during worker shutdown:", error);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
} else {
  console.log("ℹ️ Analytics worker skipped (Redis not connected).");
}
