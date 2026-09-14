"use strict";
/**
 * lib/email/queue/emailQueue.ts
 *
 * Asynchronous BullMQ Queue for non-blocking email dispatch.
 * Uses shared Redis connection from lib/redis with automatic retries and exponential backoff.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueEmailBroadcastJob = exports.emailBroadcastQueue = exports.EMAIL_BROADCAST_QUEUE_NAME = exports.enqueueEmailJob = exports.emailQueue = exports.EMAIL_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
exports.EMAIL_QUEUE_NAME = "email-delivery";
exports.emailQueue = new bullmq_1.Queue(exports.EMAIL_QUEUE_NAME, {
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
/**
 * Safely enqueues an email job. Falls back gracefully if Redis is offline.
 */
async function enqueueEmailJob(jobData, jobId) {
    if (!(0, redis_1.isRedisAvailable)()) {
        return false;
    }
    try {
        await exports.emailQueue.add("send-email", jobData, {
            jobId: jobId || `email_${jobData.logId}`,
        });
        return true;
    }
    catch (err) {
        console.warn("[EmailQueue] Failed to enqueue email job (will process inline if needed):", err.message);
        return false;
    }
}
exports.enqueueEmailJob = enqueueEmailJob;
exports.EMAIL_BROADCAST_QUEUE_NAME = "email-broadcast";
exports.emailBroadcastQueue = new bullmq_1.Queue(exports.EMAIL_BROADCAST_QUEUE_NAME, {
    connection: redis_1.redisConnection,
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
async function enqueueEmailBroadcastJob(broadcastData) {
    if (!(0, redis_1.isRedisAvailable)() || !broadcastData) {
        return false;
    }
    try {
        await exports.emailBroadcastQueue.add("broadcast-email", broadcastData, {
            jobId: `broadcast_${broadcastData.broadcastId}`,
        });
        return true;
    }
    catch (err) {
        console.warn("[EmailQueue] Failed to enqueue broadcast job:", err.message);
        return false;
    }
}
exports.enqueueEmailBroadcastJob = enqueueEmailBroadcastJob;
