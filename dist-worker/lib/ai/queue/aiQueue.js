"use strict";
/**
 * lib/ai/queue/aiQueue.ts
 *
 * BullMQ Queue definition for Asynchronous AI Generation Jobs (Images, Videos, Batches).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiJobQueue = exports.AI_JOB_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
exports.AI_JOB_QUEUE_NAME = "salesmanpro-ai-jobs";
exports.aiJobQueue = new bullmq_1.Queue(exports.AI_JOB_QUEUE_NAME, {
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
