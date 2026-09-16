"use strict";
/**
 * lib/analytics/queue/analyticsQueue.ts
 *
 * BullMQ Queue for Asynchronous Analytics Event Processing.
 * Provides resilient, non-blocking ingestion.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueTelemetryBatch = exports.analyticsQueue = exports.ANALYTICS_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
const aggregationService_1 = require("../aggregationService");
exports.ANALYTICS_QUEUE_NAME = "analytics-events";
exports.analyticsQueue = new bullmq_1.Queue(exports.ANALYTICS_QUEUE_NAME, {
    connection: redis_1.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1500,
        },
        removeOnComplete: 2000,
        removeOnFail: 5000,
    },
});
/**
 * Enqueues a batch of telemetry events.
 * Falls back to asynchronous background microtask if Redis is offline.
 */
async function enqueueTelemetryBatch(events) {
    if (!events || events.length === 0)
        return true;
    const jobData = {
        batchId: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        events,
        receivedAt: Date.now(),
    };
    if ((0, redis_1.isRedisAvailable)()) {
        try {
            await exports.analyticsQueue.add("process-batch", jobData, {
                jobId: jobData.batchId,
            });
            return true;
        }
        catch (err) {
            console.warn("[AnalyticsQueue] Redis enqueue failed, processing via background microtask:", err.message);
        }
    }
    // Fallback: asynchronous non-blocking background microtask
    setImmediate(async () => {
        try {
            await (0, aggregationService_1.processTelemetryBatch)(jobData.events);
        }
        catch (err) {
            console.error("[AnalyticsQueue] Fallback processing error:", err.message);
        }
    });
    return true;
}
exports.enqueueTelemetryBatch = enqueueTelemetryBatch;
