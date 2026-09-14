/**
 * lib/email/queue/emailWorker.ts
 *
 * BullMQ Worker processing asynchronous email delivery jobs.
 */

import { Worker, Job } from "bullmq";
import { redisConnection } from "@/lib/redis";
import {
  EMAIL_QUEUE_NAME,
  EmailJobData,
  EMAIL_BROADCAST_QUEUE_NAME,
  EmailBroadcastJobData,
} from "./emailQueue";
import { EmailService } from "../emailService";

export function createEmailWorker(): Worker<EmailJobData> {
  const worker = new Worker<EmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job: Job<EmailJobData>) => {
      console.log(`[EmailWorker] Processing job ${job.id} for ${job.data.recipient}`);

      const result = await EmailService.executeSend(job.data, job.data.logId);

      if (!result.success) {
        throw new Error(result.error || "Email delivery failed");
      }

      return result;
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[EmailWorker] Completed job ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[EmailWorker] Job ${job?.id} failed on attempt ${job?.attemptsMade}:`, err.message);
  });

  return worker;
}

export function createEmailBroadcastWorker(): Worker<EmailBroadcastJobData> {
  const worker = new Worker<EmailBroadcastJobData>(
    EMAIL_BROADCAST_QUEUE_NAME,
    async (job: Job<EmailBroadcastJobData>) => {
      const {
        broadcastId,
        tenantType,
        companyId,
        template,
        recipients,
        commonData,
        replyTo,
      } = job.data;
      console.log(
        `[EmailBroadcastWorker] Processing broadcast ${broadcastId} with ${recipients.length} recipients`
      );

      const chunkSize = 25;
      let sentCount = 0;
      let failedCount = 0;

      for (let i = 0; i < recipients.length; i += chunkSize) {
        const chunk = recipients.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (r) => {
            try {
              const res = await EmailService.sendEmail({
                tenantType,
                companyId,
                template,
                recipient: r.email,
                data: {
                  ...commonData,
                  recipientName: r.name || "valued customer",
                },
                replyTo,
                async: false,
                idempotencyKey: `broadcast_${broadcastId}_${r.email}`,
              });
              if (res.success) sentCount++;
              else failedCount++;
            } catch {
              failedCount++;
            }
          })
        );

        const progressPercent = Math.round(
          ((i + chunk.length) / recipients.length) * 100
        );
        await job.updateProgress(progressPercent);
      }

      console.log(
        `[EmailBroadcastWorker] Finished broadcast ${broadcastId}: ${sentCount} sent, ${failedCount} failed`
      );
      return { broadcastId, total: recipients.length, sentCount, failedCount };
    },
    {
      connection: redisConnection,
      concurrency: 2,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[EmailBroadcastWorker] Completed broadcast job ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[EmailBroadcastWorker] Broadcast job ${job?.id} failed:`,
      err.message
    );
  });

  return worker;
}

