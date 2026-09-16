/**
 * lib/analytics/queue/analyticsQueue.ts
 *
 * BullMQ Queue for Asynchronous Analytics Event Processing.
 * Provides resilient, non-blocking ingestion.
 */

import { Queue } from "bullmq";
import { redisConnection, isRedisAvailable } from "@/lib/redis";
import { TelemetryEventPayload } from "../types";
import { processTelemetryBatch } from "../aggregationService";

export const ANALYTICS_QUEUE_NAME = "analytics-events";

export interface AnalyticsJobData {
  batchId: string;
  events: TelemetryEventPayload[];
  receivedAt: number;
}

export const analyticsQueue = new Queue<AnalyticsJobData>(ANALYTICS_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1500,
    },
    removeOnComplete: 2000,
    removeOnFail: 5000,
  },
});

/**
 * Enqueues a batch of telemetry events.
 * Falls back to asynchronous background microtask if Redis is offline.
 */
export async function enqueueTelemetryBatch(
  events: TelemetryEventPayload[]
): Promise<boolean> {
  if (!events || events.length === 0) return true;

  const jobData: AnalyticsJobData = {
    batchId: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    events,
    receivedAt: Date.now(),
  };

  if (isRedisAvailable()) {
    try {
      await analyticsQueue.add("process-batch", jobData, {
        jobId: jobData.batchId,
      });
      return true;
    } catch (err: any) {
      console.warn("[AnalyticsQueue] Redis enqueue failed, processing via background microtask:", err.message);
    }
  }

  // Fallback: asynchronous non-blocking background microtask
  setImmediate(async () => {
    try {
      await processTelemetryBatch(jobData.events);
    } catch (err: any) {
      console.error("[AnalyticsQueue] Fallback processing error:", err.message);
    }
  });

  return true;
}
