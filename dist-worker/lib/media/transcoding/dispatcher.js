"use strict";
/**
 * lib/media/transcoding/dispatcher.ts
 *
 * Universal Background Transcoding Dispatcher for SalesmanPro.
 * Safe to call from any endpoint or service across the platform.
 * Enqueues the video into the Redis mediaProcessingQueue without blocking the HTTP response.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchVideoTranscode = void 0;
const queues_1 = require("@/lib/media/queues");
async function dispatchVideoTranscode(input) {
    try {
        const job = await queues_1.mediaProcessingQueue.add("video-transcode", input, {
            attempts: 2,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        });
        console.log(`[DISPATCHER] Enqueued video transcoding job #${job.id} for MediaAsset ${input.mediaAssetId}`);
        return { enqueued: true, jobId: job.id };
    }
    catch (error) {
        console.warn(`[DISPATCHER WARNING] Could not enqueue to Redis (running offline or build): ${error.message}`);
        return { enqueued: false, error: error.message };
    }
}
exports.dispatchVideoTranscode = dispatchVideoTranscode;
