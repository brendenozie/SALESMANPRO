"use strict";
/**
 * lib/whatsapp/queue/queue.ts
 *
 * BullMQ asynchronous queue for WhatsApp inbound webhook processing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueWhatsAppEvent = exports.whatsappQueue = exports.WHATSAPP_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
exports.WHATSAPP_QUEUE_NAME = "whatsapp-inbound";
exports.whatsappQueue = new bullmq_1.Queue(exports.WHATSAPP_QUEUE_NAME, {
    connection: redis_1.redisConnection,
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
async function enqueueWhatsAppEvent(data) {
    return exports.whatsappQueue.add("process-message", data, {
        jobId: `msg_${data.messageId}`,
    });
}
exports.enqueueWhatsAppEvent = enqueueWhatsAppEvent;
