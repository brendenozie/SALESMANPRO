"use strict";
/**
 * lib/email/queue/emailWorker.ts
 *
 * BullMQ Worker processing asynchronous email delivery jobs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailBroadcastWorker = exports.createEmailWorker = void 0;
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
function createEmailBroadcastWorker() {
    const worker = new bullmq_1.Worker(emailQueue_1.EMAIL_BROADCAST_QUEUE_NAME, async (job) => {
        const { broadcastId, tenantType, companyId, template, recipients, commonData, replyTo, } = job.data;
        console.log(`[EmailBroadcastWorker] Processing broadcast ${broadcastId} with ${recipients.length} recipients`);
        const chunkSize = 25;
        let sentCount = 0;
        let failedCount = 0;
        for (let i = 0; i < recipients.length; i += chunkSize) {
            const chunk = recipients.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (r) => {
                try {
                    const res = await emailService_1.EmailService.sendEmail({
                        tenantType,
                        companyId,
                        template,
                        recipient: r.email,
                        data: {
                            ...commonData,
                            recipientName: r.name || "valued customer",
                        },
                        replyTo,
                        async: false,
                        idempotencyKey: `broadcast_${broadcastId}_${r.email}`,
                    });
                    if (res.success)
                        sentCount++;
                    else
                        failedCount++;
                }
                catch {
                    failedCount++;
                }
            }));
            const progressPercent = Math.round(((i + chunk.length) / recipients.length) * 100);
            await job.updateProgress(progressPercent);
        }
        console.log(`[EmailBroadcastWorker] Finished broadcast ${broadcastId}: ${sentCount} sent, ${failedCount} failed`);
        return { broadcastId, total: recipients.length, sentCount, failedCount };
    }, {
        connection: redis_1.redisConnection,
        concurrency: 2,
    });
    worker.on("completed", (job) => {
        console.log(`[EmailBroadcastWorker] Completed broadcast job ${job.id}`);
    });
    worker.on("failed", (job, err) => {
        console.error(`[EmailBroadcastWorker] Broadcast job ${job?.id} failed:`, err.message);
    });
    return worker;
}
exports.createEmailBroadcastWorker = createEmailBroadcastWorker;
