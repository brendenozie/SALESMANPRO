"use strict";
/**
 * lib/social/queue/socialQueue.ts
 *
 * BullMQ Queue for Asynchronous Social Media Publishing, Scheduling, and Analytics Sync.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialJobQueue = exports.SOCIAL_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
exports.SOCIAL_QUEUE_NAME = "salesmanpro-social-jobs";
exports.socialJobQueue = new bullmq_1.Queue(exports.SOCIAL_QUEUE_NAME, {
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
