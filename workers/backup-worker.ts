/**
 * workers/backup-worker.ts
 *
 * Standalone worker process for SalesmanPro Database Automated Backups,
 * Cloud Verification, Lifecycle Retention, and Durable Disaster Recovery Restores.
 * Runs alongside the AI job worker, WhatsApp worker, and Next.js in production (via PM2).
 */

import "./resolve-alias";
import { createBackupWorker } from "../lib/backup/queue/backupWorker";
import { setupBackupSchedules } from "../lib/backup/queue/backupQueue";

console.log("🚀 Starting SalesmanPro Database Backup & Disaster Recovery Worker...");

const workerInstance = createBackupWorker();

// Initialize or update repeatable cron schedules
setupBackupSchedules().catch((err) => {
  console.error("❌ Failed to initialize backup schedules:", err);
});

console.log("✅ SalesmanPro Database Backup Worker running and listening for jobs.");

// Top-level unhandled exception / rejection guard to prevent PM2 flapping
process.on("unhandledRejection", (reason: any) => {
  console.error("⚠️ [BACKUP_WORKER] Unhandled Rejection (non-fatal):", reason?.message || reason);
});

process.on("uncaughtException", (error: Error) => {
  console.error("🚨 [BACKUP_WORKER] Uncaught Exception:", error.message);
  setTimeout(() => process.exit(1), 5000);
});

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down Backup Worker gracefully...`);
  try {
    await workerInstance.close();
    console.log("✅ Backup Worker closed safely.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during worker shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
