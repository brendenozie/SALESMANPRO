"use strict";
/**
 * workers/video-transcode-runner.ts
 *
 * Standalone Worker Process for SalesmanPro Video Transcoding.
 * Run independently via:
 * node dist/workers/video-transcode-runner.js
 * or inside Docker container (docker/video-worker.Dockerfile)
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("./resolve-alias");
const video_transcode_worker_1 = require("@/lib/media/queue/video-transcode.worker");
console.log("=================================================");
console.log("  SalesmanPro FFmpeg Video Transcode Worker");
console.log("=================================================");
const worker = (0, video_transcode_worker_1.createVideoTranscodeWorker)();
if (!worker) {
    console.error("[FATAL] Worker initialization failed or running in build phase.");
    process.exit(1);
}
// Top-level unhandled exception / rejection guard to prevent PM2 flapping
process.on("unhandledRejection", (reason) => {
    console.error("⚠️ [VIDEO_TRANSCODE_WORKER] Unhandled Rejection (non-fatal):", reason?.message || reason);
});
process.on("uncaughtException", (error) => {
    console.error("🚨 [VIDEO_TRANSCODE_WORKER] Uncaught Exception:", error.message);
    setTimeout(() => process.exit(1), 5000);
});
// Graceful shutdown handling
const shutdown = async (signal) => {
    console.log(`\n[SHUTDOWN] Received ${signal}. Closing video transcode worker gracefully...`);
    try {
        await worker.close();
        console.log("[SHUTDOWN] Worker closed successfully. Exiting.");
        process.exit(0);
    }
    catch (err) {
        console.error("[SHUTDOWN] Error closing worker:", err);
        process.exit(1);
    }
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
