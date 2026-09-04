/**
 * lib/email/queue/emailWorker.ts
 *
 * BullMQ Worker processing asynchronous email delivery jobs.
 */

import { Worker, Job } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { EMAIL_QUEUE_NAME, EmailJobData } from "./emailQueue";
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
