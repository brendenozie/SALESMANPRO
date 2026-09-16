/**
 * lib/analytics/queue/analyticsWorker.ts
 *
 * BullMQ Worker for processing batched telemetry events from the analytics queue.
 */

import { Worker, Job } from "bullmq";
import { redisConnection, isRedisAvailable } from "@/lib/redis";
import { ANALYTICS_QUEUE_NAME, AnalyticsJobData } from "./analyticsQueue";
import { processTelemetryBatch } from "../aggregationService";

export function createAnalyticsWorker(): Worker<AnalyticsJobData> | null {
  if (!isRedisAvailable()) {
    console.log("[AnalyticsWorker] Redis not available, worker will not start in standalone mode");
    return null;
  }

  const worker = new Worker<AnalyticsJobData>(
    ANALYTICS_QUEUE_NAME,
    async (job: Job<AnalyticsJobData>) => {
      const { batchId, events } = job.data;
      const res = await processTelemetryBatch(events);
      return {
        batchId,
        processed: res.processed,
        aggregated: res.aggregated,
      };
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on("completed", (job) => {
    // Debug log in development only
    if (process.env.NODE_ENV !== "production") {
      console.log(`[AnalyticsWorker] Completed job ${job.id} (batch ${job.data.batchId})`);
    }
  });

  worker.on("failed", (job, err) => {
    console.error(`[AnalyticsWorker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
