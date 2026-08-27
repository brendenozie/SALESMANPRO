/**
 * lib/whatsapp/queue/queue.ts
 *
 * BullMQ asynchronous queue for WhatsApp inbound webhook processing.
 */

import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";

export const WHATSAPP_QUEUE_NAME = "whatsapp-inbound";

export interface WhatsAppJobData {
  accountId: string;
  companyId: string;
  contactId: string;
  conversationId: string;
  messageId: string;
  correlationId: string;
}

export const whatsappQueue = new Queue<WhatsAppJobData>(WHATSAPP_QUEUE_NAME, {
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

export async function enqueueWhatsAppEvent(data: WhatsAppJobData) {
  return whatsappQueue.add("process-message", data, {
    jobId: `msg_${data.messageId}`,
  });
}
