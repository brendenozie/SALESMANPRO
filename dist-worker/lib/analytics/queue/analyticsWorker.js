"use strict";
/**
 * lib/analytics/queue/analyticsWorker.ts
 *
 * BullMQ Worker for processing batched telemetry events from the analytics queue.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnalyticsWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
const analyticsQueue_1 = require("./analyticsQueue");
const aggregationService_1 = require("../aggregationService");
function createAnalyticsWorker() {
    if (!(0, redis_1.isRedisAvailable)()) {
        console.log("[AnalyticsWorker] Redis not available, worker will not start in standalone mode");
        return null;
    }
    const worker = new bullmq_1.Worker(analyticsQueue_1.ANALYTICS_QUEUE_NAME, async (job) => {
        const { batchId, events } = job.data;
        const res = await (0, aggregationService_1.processTelemetryBatch)(events);
        return {
            batchId,
            processed: res.processed,
            aggregated: res.aggregated,
        };
    }, {
        connection: redis_1.redisConnection,
        concurrency: 5,
    });
    worker.on("completed", (job) => {
        // Debug log in development only
        if (process.env.NODE_ENV !== "production") {
            console.log(`[AnalyticsWorker] Completed job ${job.id} (batch ${job.data.batchId})`);
        }
    });
    worker.on("failed", (job, err) => {
        console.error(`[AnalyticsWorker] Job ${job?.id} failed:`, err.message);
    });
    return worker;
}
exports.createAnalyticsWorker = createAnalyticsWorker;
