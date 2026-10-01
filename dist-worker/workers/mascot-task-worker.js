"use strict";
/**
 * workers/mascot-task-worker.ts
 *
 * Standalone BullMQ Worker for the SalesmanPro Mascot Background Tasks.
 * Executes asynchronous, long-running agent tasks, multi-step reports,
 * catalog bulk updates, marketplace synchronizations, and store data audits.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMascotTaskWorker = void 0;
require("./resolve-alias");
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
const mascotQueue_1 = require("@/lib/ai/mascot/mascotQueue");
const taskService_1 = require("@/lib/ai/mascot/taskService");
const taskOrchestrator_1 = require("@/lib/ai/mascot/taskOrchestrator");
console.log("🚀 Starting SalesmanPro AI Mascot Background Task Worker...");
function createMascotTaskWorker() {
    const worker = new bullmq_1.Worker(mascotQueue_1.MASCOT_TASK_QUEUE_NAME, async (job) => {
        const { taskId, companyId } = job.data;
        console.log(`[MASCOT_WORKER_JOB_START] Job ${job.id} - Processing Task #${taskId}`);
        const task = await taskService_1.MascotTaskService.getTaskById(taskId, companyId, true);
        if (!task) {
            console.warn(`[MASCOT_WORKER] Task #${taskId} not found or deleted. Skipping.`);
            return { skipped: true };
        }
        if (task.status === "CANCELLED" || task.status === "AWAITING_APPROVAL" || task.status === "PAUSED") {
            console.log(`[MASCOT_WORKER] Task #${taskId} is in state ${task.status}. Aborting execution.`);
            return { aborted: true, status: task.status };
        }
        try {
            await taskOrchestrator_1.MascotTaskOrchestrator.executeTask(task);
            console.log(`[MASCOT_WORKER_JOB_COMPLETE] Job ${job.id} - Task #${taskId} completed successfully`);
            return { success: true };
        }
        catch (err) {
            console.error(`[MASCOT_WORKER_JOB_ERROR] Job ${job.id} - Task #${taskId} failed:`, err?.message || err);
            throw err;
        }
    }, {
        connection: redis_1.redisConnection,
        concurrency: 3,
    });
    worker.on("error", (err) => {
        console.error("[MASCOT_WORKER_REDIS_ERROR] BullMQ worker connection error:", err.message);
    });
    worker.on("failed", (job, err) => {
        console.error(`[MASCOT_WORKER_JOB_FAILED] Job ${job?.id} failed with error:`, err.message);
    });
    return worker;
}
exports.createMascotTaskWorker = createMascotTaskWorker;
const worker = createMascotTaskWorker();
console.log("✅ SalesmanPro AI Mascot Background Task Worker running and listening for jobs.");
// Top-level unhandled exception / rejection guard
process.on("unhandledRejection", (reason) => {
    console.error("⚠️ [MASCOT_WORKER] Unhandled Rejection (non-fatal):", reason?.message || reason);
});
process.on("uncaughtException", (error) => {
    console.error("🚨 [MASCOT_WORKER] Uncaught Exception:", error.message);
    setTimeout(() => process.exit(1), 5000);
});
// Graceful shutdown
const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down Mascot Task Worker gracefully...`);
    try {
        await worker.close();
        console.log("✅ Mascot Task Worker closed.");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error during mascot task worker shutdown:", error);
        process.exit(1);
    }
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
