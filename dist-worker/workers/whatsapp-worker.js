"use strict";
/**
 * workers/whatsapp-worker.ts
 *
 * Standalone worker process for processing WhatsApp AI jobs via BullMQ.
 * Run with PM2 or Docker.
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("./resolve-alias");
const worker_1 = require("@/lib/whatsapp/queue/worker");
console.log("🚀 Starting SalesmanPro WhatsApp AI Worker...");
const worker = (0, worker_1.createWhatsAppWorker)();
console.log("✅ WhatsApp AI Worker running and listening for jobs.");
// Graceful shutdown handling
const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down WhatsApp Worker gracefully...`);
    try {
        await worker.close();
        console.log("✅ WhatsApp Worker closed.");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error during worker shutdown:", error);
        process.exit(1);
    }
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
