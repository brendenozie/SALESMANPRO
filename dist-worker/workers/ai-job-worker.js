"use strict";
/**
 * workers/ai-job-worker.ts
 *
 * Standalone worker process for processing SalesmanPro AI generation jobs (Images & Videos).
 * Runs alongside the WhatsApp worker in production (via PM2).
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("./resolve-alias");
const aiWorker_1 = require("@/lib/ai/queue/aiWorker");
console.log("🚀 Starting SalesmanPro Central AI Job Worker...");
const worker = (0, aiWorker_1.createAIJobWorker)();
console.log("✅ SalesmanPro AI Job Worker running and listening for jobs.");
// Top-level unhandled exception / rejection guard to prevent PM2 flapping
process.on("unhandledRejection", (reason) => {
    console.error("⚠️ [AI_JOB_WORKER] Unhandled Rejection (non-fatal):", reason?.message || reason);
});
process.on("uncaughtException", (error) => {
    console.error("🚨 [AI_JOB_WORKER] Uncaught Exception:", error.message);
    setTimeout(() => process.exit(1), 5000);
});
// Graceful shutdown handling
const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down AI Job Worker gracefully...`);
    try {
        await worker.close();
        console.log("✅ AI Job Worker closed.");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error during worker shutdown:", error);
        process.exit(1);
    }
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
