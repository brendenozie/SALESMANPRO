"use strict";
/**
 * lib/whatsapp/queue/worker.ts
 *
 * BullMQ Worker processing inbound WhatsApp events asynchronously.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWhatsAppWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
const queue_1 = require("./queue");
const messageProcessor_1 = require("../messageProcessor");
const workerHealth_1 = require("../workerHealth");
function createWhatsAppWorker() {
    const heartbeat = setInterval(() => {
        (0, workerHealth_1.touchWhatsAppWorkerHeartbeat)().catch(() => undefined);
    }, 20_000);
    void (0, workerHealth_1.touchWhatsAppWorkerHeartbeat)();
    const worker = new bullmq_1.Worker(queue_1.WHATSAPP_QUEUE_NAME, async (job) => {
        const { accountId, companyId, contactId, conversationId, messageId, correlationId, } = job.data;
        console.log("[WHATSAPP_WORKER_JOB_START]", {
            jobId: job.id,
            conversationId,
            messageId,
            correlationId,
        });
        await (0, messageProcessor_1.processWhatsAppMessageJob)({
            accountId,
            companyId,
            contactId,
            conversationId,
            messageId,
            correlationId,
        });
        await (0, workerHealth_1.touchWhatsAppWorkerHeartbeat)();
        console.log("[WHATSAPP_WORKER_JOB_COMPLETED]", {
            jobId: job.id,
            conversationId,
            correlationId,
        });
    }, {
        connection: redis_1.redisConnection,
        concurrency: 5,
        limiter: {
            max: 50,
            duration: 1000,
        },
    });
    worker.on("failed", (job, err) => {
        console.error("[WHATSAPP_WORKER_JOB_FAILED]", {
            jobId: job?.id,
            error: err.message,
        });
    });
    worker.on("error", (err) => {
        console.error("[WHATSAPP_WORKER_ERROR]", err);
    });
    worker.on("closed", () => {
        clearInterval(heartbeat);
    });
    return worker;
}
exports.createWhatsAppWorker = createWhatsAppWorker;
