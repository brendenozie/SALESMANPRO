/**
 * workers/whatsapp-worker.ts
 *
 * Standalone worker process for processing WhatsApp AI jobs via BullMQ.
 * Run with PM2 or Docker.
 */

import "./resolve-alias";
import { createWhatsAppWorker } from "@/lib/whatsapp/queue/worker";

console.log("🚀 Starting SalesmanPro WhatsApp AI Worker...");

const worker = createWhatsAppWorker();

console.log("✅ WhatsApp AI Worker running and listening for jobs.");

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down WhatsApp Worker gracefully...`);
  try {
    await worker.close();
    console.log("✅ WhatsApp Worker closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during worker shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
