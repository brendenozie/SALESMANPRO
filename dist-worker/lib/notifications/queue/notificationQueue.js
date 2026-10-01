"use strict";
/**
 * lib/notifications/queue/notificationQueue.ts
 *
 * BullMQ Asynchronous Queue for reliable notification channel delivery.
 * Uses shared Redis connection from lib/redis with automatic retries,
 * dead-letter tracking, and graceful inline fallback if Redis is unavailable.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueNotificationJob = exports.notificationQueue = exports.NOTIFICATION_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
exports.NOTIFICATION_QUEUE_NAME = "notification-dispatch";
exports.notificationQueue = new bullmq_1.Queue(exports.NOTIFICATION_QUEUE_NAME, {
    connection: redis_1.redisConnection,
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
async function enqueueNotificationJob(jobData, jobId) {
    if (!(0, redis_1.isRedisAvailable)()) {
        return false;
    }
    try {
        await exports.notificationQueue.add("dispatch-notification", jobData, {
            jobId: jobId || `notif_${jobData.notificationId}`,
        });
        return true;
    }
    catch (err) {
        console.warn("[NotificationQueue] Failed to enqueue notification job (will fallback to inline processing):", err.message);
        return false;
    }
}
exports.enqueueNotificationJob = enqueueNotificationJob;
