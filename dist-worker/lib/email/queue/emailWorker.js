"use strict";
/**
 * lib/email/queue/emailWorker.ts
 *
 * BullMQ Worker processing asynchronous email delivery jobs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
const emailQueue_1 = require("./emailQueue");
const emailService_1 = require("../emailService");
function createEmailWorker() {
    const worker = new bullmq_1.Worker(emailQueue_1.EMAIL_QUEUE_NAME, async (job) => {
        console.log(`[EmailWorker] Processing job ${job.id} for ${job.data.recipient}`);
        const result = await emailService_1.EmailService.executeSend(job.data, job.data.logId);
        if (!result.success) {
            throw new Error(result.error || "Email delivery failed");
        }
        return result;
    }, {
        connection: redis_1.redisConnection,
        concurrency: 5,
    });
    worker.on("completed", (job) => {
        console.log(`[EmailWorker] Completed job ${job.id}`);
    });
    worker.on("failed", (job, err) => {
        console.error(`[EmailWorker] Job ${job?.id} failed on attempt ${job?.attemptsMade}:`, err.message);
    });
    return worker;
}
exports.createEmailWorker = createEmailWorker;
