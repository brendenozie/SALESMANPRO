"use strict";
/**
 * lib/observability/queueMonitor.ts
 *
 * BullMQ Queue & Background Worker Monitor.
 * Safely inspects job counts, backlogs, worker heartbeats, and allows
 * Superadmin job retries without risking execution deadlocks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryFailedQueueJobs = exports.getAllQueueStatuses = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
const MONITORED_QUEUES = [
    { name: "whatsapp-messages", displayName: "WhatsApp AI & Outbound" },
    { name: "ai-jobs", displayName: "AI Model Inference & Generation" },
    { name: "ai-workforce-tasks", displayName: "Autonomous AI Workforce" },
    { name: "social-media-jobs", displayName: "Social Publishing & Sync" },
    { name: "backup-jobs", displayName: "Database Automated Backups" },
    { name: "restore-jobs", displayName: "Database Disaster Recovery" },
    { name: "email-queue", displayName: "Transactional Email Delivery" },
    { name: "email-broadcast-queue", displayName: "Marketing Broadcasts" },
    { name: "media-ai", displayName: "Media AI Tagging & Vision" },
    { name: "media-processing", displayName: "Image & Video Compression" },
    { name: "analytics-events", displayName: "Analytics Batch Processing" },
];
const queueInstances = new Map();
function getQueueInstance(name) {
    if (!(0, redis_1.isRedisAvailable)())
        return null;
    if (queueInstances.has(name)) {
        return queueInstances.get(name);
    }
    try {
        const queue = new bullmq_1.Queue(name, {
            connection: (0, redis_1.getRedisClient)(),
        });
        queueInstances.set(name, queue);
        return queue;
    }
    catch (err) {
        return null;
    }
}
/**
 * Inspects all configured BullMQ queues across the platform
 */
async function getAllQueueStatuses() {
    if (!(0, redis_1.isRedisAvailable)()) {
        return MONITORED_QUEUES.map((q) => ({
            name: q.name,
            displayName: q.displayName,
            waiting: 0,
            active: 0,
            completed: 0,
            failed: 0,
            delayed: 0,
            paused: false,
            isHealthy: false,
            workerCount: 0,
        }));
    }
    const results = await Promise.all(MONITORED_QUEUES.map(async (qDef) => {
        try {
            const q = getQueueInstance(qDef.name);
            if (!q) {
                return {
                    name: qDef.name,
                    displayName: qDef.displayName,
                    waiting: 0,
                    active: 0,
                    completed: 0,
                    failed: 0,
                    delayed: 0,
                    paused: false,
                    isHealthy: false,
                    workerCount: 0,
                };
            }
            const counts = await Promise.race([
                q.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000)),
            ]);
            const workers = await q.getWorkers().catch(() => []);
            const isPaused = await q.isPaused().catch(() => false);
            const hasCriticalBacklog = (counts.waiting || 0) > 200 || (counts.failed || 0) > 50;
            return {
                name: qDef.name,
                displayName: qDef.displayName,
                waiting: counts.waiting || 0,
                active: counts.active || 0,
                completed: counts.completed || 0,
                failed: counts.failed || 0,
                delayed: counts.delayed || 0,
                paused: isPaused,
                isHealthy: !hasCriticalBacklog,
                workerCount: workers.length,
            };
        }
        catch (err) {
            return {
                name: qDef.name,
                displayName: qDef.displayName,
                waiting: 0,
                active: 0,
                completed: 0,
                failed: 0,
                delayed: 0,
                paused: false,
                isHealthy: false,
                workerCount: 0,
            };
        }
    }));
    return results;
}
exports.getAllQueueStatuses = getAllQueueStatuses;
/**
 * Retries failed jobs for a specific queue (Superadmin action)
 */
async function retryFailedQueueJobs(queueName, maxJobs = 20) {
    if (!(0, redis_1.isRedisAvailable)())
        throw new Error("Redis is currently unavailable");
    const q = getQueueInstance(queueName);
    if (!q)
        throw new Error(`Queue ${queueName} not found`);
    const failedJobs = await q.getFailed(0, maxJobs);
    let retried = 0;
    for (const job of failedJobs) {
        try {
            await job.retry();
            retried++;
        }
        catch { }
    }
    return { retried };
}
exports.retryFailedQueueJobs = retryFailedQueueJobs;
