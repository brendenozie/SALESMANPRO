/**
 * lib/social/queue/socialQueue.ts
 *
 * BullMQ Queue for Asynchronous Social Media Publishing, Scheduling, and Analytics Sync.
 */

import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";

export const SOCIAL_QUEUE_NAME = "salesmanpro-social-jobs";

export interface SocialJobData {
  companyId: string;
  postId?: string;
  publicationId?: string;
  action?: "PUBLISH_SCHEDULED_POST" | "SYNC_ANALYTICS" | "RETRY_PUBLICATION";
}

export const socialJobQueue = new Queue<SocialJobData>(SOCIAL_QUEUE_NAME, {
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
