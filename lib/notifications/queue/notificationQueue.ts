/**
 * lib/notifications/queue/notificationQueue.ts
 *
 * BullMQ Asynchronous Queue for reliable notification channel delivery.
 * Uses shared Redis connection from lib/redis with automatic retries,
 * dead-letter tracking, and graceful inline fallback if Redis is unavailable.
 */

import { Queue } from "bullmq";
import { redisConnection, isRedisAvailable } from "@/lib/redis";
import { NotificationChannel } from "../types";

export const NOTIFICATION_QUEUE_NAME = "notification-dispatch";

export interface NotificationJobData {
  notificationId: string;
  channels: NotificationChannel[];
  recipientUserIds: string[];
}

export const notificationQueue = new Queue<NotificationJobData>(NOTIFICATION_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1500,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

/**
 * Safely enqueues a notification dispatch job.
 * Returns true if enqueued into BullMQ, or false if offline/failed.
 */
export async function enqueueNotificationJob(
  jobData: NotificationJobData,
  jobId?: string
): Promise<boolean> {
  if (!isRedisAvailable()) {
    return false;
  }
  try {
    await notificationQueue.add("dispatch-notification", jobData, {
      jobId: jobId || `notif_${jobData.notificationId}`,
    });
    return true;
  } catch (err: any) {
    console.warn(
      "[NotificationQueue] Failed to enqueue notification job (will fallback to inline processing):",
      err.message
    );
    return false;
  }
}
