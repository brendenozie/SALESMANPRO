/**
 * workers/notification-worker.ts
 *
 * Standalone worker process for processing asynchronous notification channel dispatches.
 * Processes BullMQ jobs from the 'notification-dispatch' queue, handling email, push (Android/Desktop),
 * and in-app delivery tracking. Runs with PM2 in production.
 */

import "./resolve-alias";
import { createNotificationWorker } from "@/lib/notifications/queue/notificationWorker";

console.log("🚀 Starting SalesmanPro Unified Notification Worker...");

const worker = createNotificationWorker();

console.log("✅ SalesmanPro Notification Worker running and listening for dispatch jobs.");

// Top-level unhandled exception / rejection guard to prevent PM2 flapping
process.on("unhandledRejection", (reason: any) => {
  console.error("⚠️ [NOTIFICATION_WORKER] Unhandled Rejection (non-fatal):", reason?.message || reason);
});

process.on("uncaughtException", (error: Error) => {
  console.error("🚨 [NOTIFICATION_WORKER] Uncaught Exception:", error.message);
  setTimeout(() => process.exit(1), 5000);
});

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down Notification Worker gracefully...`);
  try {
    await worker.close();
    console.log("✅ Notification Worker closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during notification worker shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
