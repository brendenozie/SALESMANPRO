"use strict";
/**
 * workers/backup-worker.ts
 *
 * Standalone worker process for SalesmanPro Database Automated Backups,
 * Cloud Verification, Lifecycle Retention, and Durable Disaster Recovery Restores.
 * Runs alongside the AI job worker, WhatsApp worker, and Next.js in production (via PM2).
 */
Object.defineProperty(exports, "__esModule", { value: true });
const backupWorker_1 = require("../lib/backup/queue/backupWorker");
const backupQueue_1 = require("../lib/backup/queue/backupQueue");
console.log("🚀 Starting SalesmanPro Database Backup & Disaster Recovery Worker...");
const workerInstance = (0, backupWorker_1.createBackupWorker)();
// Initialize or update repeatable cron schedules
(0, backupQueue_1.setupBackupSchedules)().catch((err) => {
    console.error("❌ Failed to initialize backup schedules:", err);
});
console.log("✅ SalesmanPro Database Backup Worker running and listening for jobs.");
// Graceful shutdown handling
const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down Backup Worker gracefully...`);
    try {
        await workerInstance.close();
        console.log("✅ Backup Worker closed safely.");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error during worker shutdown:", error);
        process.exit(1);
    }
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
