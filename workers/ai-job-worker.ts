/**
 * workers/ai-job-worker.ts
 *
 * Standalone worker process for processing SalesmanPro AI generation jobs (Images & Videos).
 * Runs alongside the WhatsApp worker in production (via PM2).
 */

import { createAIJobWorker } from "@/lib/ai/queue/aiWorker";

console.log("🚀 Starting SalesmanPro Central AI Job Worker...");

const worker = createAIJobWorker();

console.log("✅ SalesmanPro AI Job Worker running and listening for jobs.");

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down AI Job Worker gracefully...`);
  try {
    await worker.close();
    console.log("✅ AI Job Worker closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during worker shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
