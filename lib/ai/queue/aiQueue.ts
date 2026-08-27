/**
 * lib/ai/queue/aiQueue.ts
 *
 * BullMQ Queue definition for Asynchronous AI Generation Jobs (Images, Videos, Batches).
 */

import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";

export const AI_JOB_QUEUE_NAME = "salesmanpro-ai-jobs";

export interface AIJobData {
  jobId: string;
  companyId: string;
  userId?: string;
  capability: "IMAGE" | "VIDEO" | "TEXT" | "BATCH";
  action: string;
  prompt: string;
  options?: Record<string, unknown>;
  inputAssets?: Record<string, unknown>;
}

export const aiJobQueue = new Queue<AIJobData>(AI_JOB_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});
