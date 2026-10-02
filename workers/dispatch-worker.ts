/**
 * workers/dispatch-worker.ts
 *
 * Standalone worker process for processing SalesmanPro On-Demand Rider Dispatch jobs.
 * Runs in background alongside AI and WhatsApp workers.
 */

import "./resolve-alias";
import { createDispatchWorker } from "@/lib/dispatch/dispatchQueue";

console.log("🚀 Starting SalesmanPro Rider Dispatch Worker...");

const worker = createDispatchWorker();

console.log("✅ SalesmanPro Rider Dispatch Worker running and listening for dispatch jobs.");

process.on("unhandledRejection", (reason: any) => {
  console.error("⚠️ [DISPATCH_WORKER] Unhandled Rejection:", reason?.message || reason);
});

process.on("uncaughtException", (error: Error) => {
  console.error("🚨 [DISPATCH_WORKER] Uncaught Exception:", error.message);
  setTimeout(() => process.exit(1), 5000);
});

const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down Dispatch Worker gracefully...`);
  try {
    await worker.close();
    console.log("✅ Dispatch Worker closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during worker shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
