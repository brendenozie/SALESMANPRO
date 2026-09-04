"use strict";
/**
 * workers/social-worker.ts
 *
 * Standalone worker process for processing SalesmanPro Social Media publishing jobs.
 * Runs alongside the AI job worker and WhatsApp worker (e.g. via PM2 / Docker).
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("./resolve-alias");
const socialWorker_1 = require("@/lib/social/queue/socialWorker");
console.log("🚀 Starting SalesmanPro Social Media Publishing Worker...");
const worker = (0, socialWorker_1.createSocialJobWorker)();
console.log("✅ SalesmanPro Social Media Worker running and listening for jobs.");
const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down Social Worker gracefully...`);
    try {
        await worker.close();
        console.log("✅ Social Worker closed.");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error during social worker shutdown:", error);
        process.exit(1);
    }
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
