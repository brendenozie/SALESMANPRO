"use strict";
/**
 * lib/ai/workforce/queue.ts
 *
 * BullMQ Queue definitions for Asynchronous AI Workforce Tasks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueWorkforceTask = exports.workforceQueue = exports.WORKFORCE_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
exports.WORKFORCE_QUEUE_NAME = "salesmanpro-ai-workforce";
exports.workforceQueue = new bullmq_1.Queue(exports.WORKFORCE_QUEUE_NAME, {
    connection: redis_1.redisConnection,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: 500,
        removeOnFail: 2000,
    },
});
async function enqueueWorkforceTask(input, context) {
    const job = await exports.workforceQueue.add(`task_${input.agentKey}_${Date.now()}`, { input, context }, {
        priority: input.priority || 2,
    });
    return { jobId: job.id };
}
exports.enqueueWorkforceTask = enqueueWorkforceTask;
