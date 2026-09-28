"use strict";
/**
 * lib/media/queue/video-transcode.worker.ts
 *
 * BullMQ Worker for Asynchronous, Crash-Resistant Video Transcoding.
 * Key Architectural Safeguards:
 * 1. Strict Concurrency Cap (Default: 1): Prevents server CPU & RAM exhaustion when multiple users upload at once.
 * 2. Asynchronous Execution: Web server never blocks; jobs are queued in Redis and executed sequentially.
 * 3. Graceful Fallback: If transcoding fails or is unavailable, asset marks READY with raw MP4.
 * 4. Build-phase safety: Prevents Redis connection attempts during `next build`.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVideoTranscodeWorker = void 0;
const bullmq_1 = require("bullmq");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const redis_1 = require("@/lib/redis");
const videoTranscoder_1 = require("../transcoding/videoTranscoder");
const isBuildPhase = process.env.NEXT_IS_BUILD_PHASE === "true" ||
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build" ||
    process.env.NEXT_BUILD === "1" ||
    (typeof process !== "undefined" &&
        Array.isArray(process.argv) &&
        process.argv.some((arg) => typeof arg === "string" && arg.includes("build")));
/**
 * Concurrency limit for video encoding.
 * Default is 1 (Single sequential worker) to guarantee zero CPU starvation on the main web server.
 * Can be raised via environment variable MEDIA_TRANSCODE_CONCURRENCY on high-core dedicated workers.
 */
const CONCURRENCY_LIMIT = Math.max(1, parseInt(process.env.MEDIA_TRANSCODE_CONCURRENCY || "1", 10));
function createVideoTranscodeWorker() {
    if (isBuildPhase) {
        return null;
    }
    console.log(`[VIDEO WORKER] Initializing Transcode Worker (Concurrency: ${CONCURRENCY_LIMIT})...`);
    const worker = new bullmq_1.Worker("media-processing", async (job) => {
        const { mediaAssetId, companyId, sourceUrl } = job.data;
        console.log(`[VIDEO WORKER] Processing job #${job.id} for MediaAsset ${mediaAssetId}...`);
        // 1. Mark asset status as PROCESSING
        await prismadb_1.default.mediaAsset
            .update({
            where: { id: mediaAssetId },
            data: { status: "PROCESSING" },
        })
            .catch(() => null);
        await job.updateProgress(10);
        // 2. Execute CPU-bounded Transcode
        const result = await (0, videoTranscoder_1.transcodeVideoToHLS)({
            mediaAssetId,
            companyId,
            sourceUrl,
        });
        await job.updateProgress(80);
        // 3. Update database record with transcoded results
        if (result.success && result.mode === "HLS" && result.hlsUrl) {
            await prismadb_1.default.mediaAsset
                .update({
                where: { id: mediaAssetId },
                data: {
                    url: result.hlsUrl,
                    thumbnailUrl: result.thumbnailUrl || undefined,
                    status: "READY",
                },
            })
                .catch((err) => console.error("[VIDEO WORKER] DB update error:", err));
            console.log(`[VIDEO WORKER] Job #${job.id} completed. HLS stream ready at ${result.hlsUrl}`);
        }
        else {
            // Fallback: keep raw source URL so video remains playable
            await prismadb_1.default.mediaAsset
                .update({
                where: { id: mediaAssetId },
                data: { status: "READY" },
            })
                .catch(() => null);
            console.log(`[VIDEO WORKER] Job #${job.id} finished in passthrough mode.`);
        }
        await job.updateProgress(100);
        return result;
    }, {
        connection: redis_1.redisConnection,
        concurrency: CONCURRENCY_LIMIT,
        lockDuration: 900000, // 15-minute lock duration
    });
    worker.on("failed", async (job, err) => {
        console.error(`[VIDEO WORKER] Job #${job?.id} failed:`, err.message);
        if (job?.data?.mediaAssetId) {
            await prismadb_1.default.mediaAsset
                .update({
                where: { id: job.data.mediaAssetId },
                data: { status: "READY" }, // Fallback to ready with original raw MP4
            })
                .catch(() => null);
        }
    });
    worker.on("error", (err) => {
        console.error("[VIDEO WORKER] Redis/Worker error:", err.message);
    });
    return worker;
}
exports.createVideoTranscodeWorker = createVideoTranscodeWorker;
