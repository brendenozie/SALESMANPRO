/**
 * workers/ai-workforce-worker.ts
 *
 * Standalone BullMQ Worker for the 3-Tier SalesmanPro AI Agent Workforce.
 * Executes asynchronous, long-running agent tasks, multi-step growth campaigns,
 * and Ghuba marketplace intelligence processing.
 */

import "./resolve-alias";
import { Worker, Job } from "bullmq";
import { bullmqRedisConnection } from "@/lib/redis";
import { WORKFORCE_QUEUE_NAME, WorkforceJobData } from "@/lib/ai/workforce/queue";
import { WorkforceOrchestrator } from "@/lib/ai/workforce/orchestrator";
import {
  registerWorkforceSchedulers,
  triggerDailyStoreBriefings,
  checkOverdueOrdersAndFulfillmentExceptions,
  monitorLowStockAndCatalogueHealth,
  reconcilePendingPayments,
} from "@/lib/ai/workforce/scheduler";

console.log("🚀 Starting SalesmanPro AI Workforce Background Worker...");

const orchestrator = new WorkforceOrchestrator();

export function createWorkforceWorker() {
  const worker = new Worker<WorkforceJobData>(
    WORKFORCE_QUEUE_NAME,
    async (job: Job<WorkforceJobData>) => {
      // 1. Handle Scheduled Daily Store Briefing (07:00 EAT)
      if (job.name === "daily-store-briefing-cron") {
        console.log(`[WORKFORCE_CRON_JOB] Executing 07:00 EAT Daily Store Briefings...`);
        return await triggerDailyStoreBriefings();
      }

      // 2. Handle Overdue Orders & Fulfillment Exceptions (~5 min)
      if (job.name === "overdue-orders-monitor-cron") {
        console.log(`[WORKFORCE_CRON_JOB] Executing Overdue Orders & Fulfillment Exception Monitor...`);
        return await checkOverdueOrdersAndFulfillmentExceptions();
      }

      // 3. Handle Low Stock & Catalog Health Monitor (~15 min)
      if (job.name === "low-stock-monitor-cron") {
        console.log(`[WORKFORCE_CRON_JOB] Executing Low Stock & Catalog Health Monitor...`);
        return await monitorLowStockAndCatalogueHealth();
      }

      // 4. Handle Payment Reconciliation (~10 min)
      if (job.name === "payment-reconciliation-cron") {
        console.log(`[WORKFORCE_CRON_JOB] Executing Payment Reconciliation Monitor...`);
        return await reconcilePendingPayments();
      }

      const { input, context } = job.data;
      console.log(`[WORKFORCE_JOB_START] Job ${job.id} - Agent: ${input.agentKey} - Level: ${context.level}`);

      try {
        const result = await orchestrator.execute(input, context);
        console.log(`[WORKFORCE_JOB_COMPLETE] Job ${job.id} - Status: ${result.status} - Cost: ${result.creditsUsed} credits`);
        return result;
      } catch (error: any) {
        console.error(`[WORKFORCE_JOB_ERROR] Job ${job.id} failed:`, error?.message || error);
        throw error;
      }
    },
    {
      connection: bullmqRedisConnection,
      concurrency: 3,
    },
  );

  worker.on("error", (err) => {
    console.error("[WORKFORCE_WORKER_REDIS_ERROR] BullMQ worker connection error:", err.message);
  });

  worker.on("failed", (job, err) => {
    console.error(`[WORKFORCE_JOB_FAILED] Job ${job?.id} failed with error:`, err.message);
  });

  return worker;
}

const worker = createWorkforceWorker();

// Register scheduled cron triggers (e.g., 07:00 EAT Daily Store Briefings)
registerWorkforceSchedulers().catch((err) => {
  console.error("❌ [WORKFORCE_WORKER] Failed to register workforce schedulers:", err);
});

console.log("✅ SalesmanPro AI Workforce Worker running and listening for agent jobs.");

// Top-level unhandled exception / rejection guard to prevent PM2 flapping
process.on("unhandledRejection", (reason: any) => {
  console.error("⚠️ [WORKFORCE_WORKER] Unhandled Rejection (non-fatal):", reason?.message || reason);
});

process.on("uncaughtException", (error: Error) => {
  console.error("🚨 [WORKFORCE_WORKER] Uncaught Exception:", error.message);
  // Allow pending jobs to drain or exit gracefully without instantaneous crash
  setTimeout(() => process.exit(1), 5000);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down AI Workforce Worker gracefully...`);
  try {
    await worker.close();
    console.log("✅ AI Workforce Worker closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during workforce worker shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
