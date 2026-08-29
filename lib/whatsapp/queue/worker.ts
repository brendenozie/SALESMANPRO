/**
 * lib/whatsapp/queue/worker.ts
 *
 * BullMQ Worker processing inbound WhatsApp events asynchronously.
 */

import { Worker, Job } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { WHATSAPP_QUEUE_NAME, WhatsAppJobData } from "./queue";
import { processWhatsAppMessageJob } from "../messageProcessor";
import { touchWhatsAppWorkerHeartbeat } from "../workerHealth";

export function createWhatsAppWorker() {
  const heartbeat = setInterval(() => {
    touchWhatsAppWorkerHeartbeat().catch(() => undefined);
  }, 20_000);
  void touchWhatsAppWorkerHeartbeat();

  const worker = new Worker<WhatsAppJobData>(
    WHATSAPP_QUEUE_NAME,
    async (job: Job<WhatsAppJobData>) => {
      const {
        accountId,
        companyId,
        contactId,
        conversationId,
        messageId,
        correlationId,
      } = job.data;

      console.log("[WHATSAPP_WORKER_JOB_START]", {
        jobId: job.id,
        conversationId,
        messageId,
        correlationId,
      });

      await processWhatsAppMessageJob({
        accountId,
        companyId,
        contactId,
        conversationId,
        messageId,
        correlationId,
      });

      await touchWhatsAppWorkerHeartbeat();

      console.log("[WHATSAPP_WORKER_JOB_COMPLETED]", {
        jobId: job.id,
        conversationId,
        correlationId,
      });
    },
    {
      connection: redisConnection,
      concurrency: 5,
      limiter: {
        max: 50,
        duration: 1000,
      },
    },
  );

  worker.on("failed", (job, err) => {
    console.error("[WHATSAPP_WORKER_JOB_FAILED]", {
      jobId: job?.id,
      error: err.message,
    });
  });

  worker.on("error", (err) => {
    console.error("[WHATSAPP_WORKER_ERROR]", err);
  });

  worker.on("closed", () => {
    clearInterval(heartbeat);
  });

  return worker;
}
