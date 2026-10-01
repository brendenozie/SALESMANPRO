"use strict";
/**
 * lib/ai/mascot/mascotQueue.ts
 *
 * BullMQ Queue definitions and background job submission for the SalesmanPro Mascot.
 * Handles job queuing, exponential retry policies, Redis connection lifecycle,
 * and reliable asynchronous execution across server restarts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueMascotJob = exports.getMascotQueue = exports.MASCOT_TASK_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
const taskOrchestrator_1 = require("./taskOrchestrator");
exports.MASCOT_TASK_QUEUE_NAME = "salesmanpro-mascot-tasks";
let _mascotQueue = null;
function getMascotQueue() {
    if (!_mascotQueue) {
        _mascotQueue = new bullmq_1.Queue(exports.MASCOT_TASK_QUEUE_NAME, {
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
    }
    return _mascotQueue;
}
exports.getMascotQueue = getMascotQueue;
/**
 * Enqueues a validated Mascot task into the BullMQ background queue.
 * Includes graceful asynchronous runner fallback if Redis is unavailable.
 */
async function enqueueMascotJob(task) {
    const jobId = `mascot_${task.id}`;
    try {
        const queue = getMascotQueue();
        const job = await queue.add(`task_${task.taskType}_${task.id}`, { taskId: task.id, companyId: task.companyId }, {
            jobId,
            priority: task.priority,
        });
        console.log(`[MascotQueue] Enqueued job ${job.id} for task #${task.id}`);
        return { queued: true, jobId: job.id || jobId };
    }
    catch (err) {
        console.warn(`[MascotQueue] Redis queue enqueue failed (${err?.message}). Running via asynchronous execution runner.`);
        // Fallback: Asynchronous execution without blocking HTTP response
        setImmediate(async () => {
            try {
                await taskOrchestrator_1.MascotTaskOrchestrator.executeTask(task);
            }
            catch (execErr) {
                console.error(`[MascotQueueFallback] Execution error for task ${task.id}:`, execErr);
            }
        });
        return { queued: true, jobId };
    }
}
exports.enqueueMascotJob = enqueueMascotJob;
