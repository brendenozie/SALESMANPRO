/**
 * lib/email/queue/emailQueue.ts
 *
 * Asynchronous BullMQ Queue for non-blocking email dispatch.
 * Uses shared Redis connection from lib/redis with automatic retries and exponential backoff.
 */

import { Queue } from "bullmq";
import { redisConnection, isRedisAvailable } from "@/lib/redis";
import { EmailTemplateId, EmailTenantType } from "../types";

export const EMAIL_QUEUE_NAME = "email-delivery";

export interface EmailJobData {
  logId: string;
  tenantType: EmailTenantType;
  companyId?: string;
  template: EmailTemplateId;
  recipient: string;
  data: Record<string, any>;
  replyTo?: string;
}

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

/**
 * Safely enqueues an email job. Falls back gracefully if Redis is offline.
 */
export async function enqueueEmailJob(
  jobData: EmailJobData,
  jobId?: string
): Promise<boolean> {
  try {
    await emailQueue.add("send-email", jobData, {
      jobId: jobId || `email_${jobData.logId}`,
    });
    return true;
  } catch (err: any) {
    console.warn(
      "[EmailQueue] Failed to enqueue email job (will process inline if needed):",
      err.message
    );
    return false;
  }
}
