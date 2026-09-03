"use strict";
/**
 * lib/social/queue/socialWorker.ts
 *
 * BullMQ Worker for processing scheduled social media posts and retries.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSocialJobWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
const socialQueue_1 = require("./socialQueue");
const socialService_1 = require("../socialService");
function createSocialJobWorker() {
    const worker = new bullmq_1.Worker(socialQueue_1.SOCIAL_QUEUE_NAME, async (job) => {
        const { companyId, postId, publicationId, action } = job.data;
        console.log(`[SocialWorker] Processing job ${job.id} for company ${companyId}, action: ${action || "PUBLISH"}`);
        try {
            if (action === "RETRY_PUBLICATION" && publicationId) {
                await socialService_1.socialService.retryPublication(companyId, publicationId);
            }
            else if (postId) {
                await socialService_1.socialService.publishNow(companyId, postId);
            }
        }
        catch (err) {
            console.error(`[SocialWorker] Job ${job.id} failed:`, err);
            throw err;
        }
    }, {
        connection: redis_1.redisConnection,
        concurrency: 5,
    });
    worker.on("completed", (job) => {
        console.log(`[SocialWorker] Job ${job.id} completed successfully`);
    });
    worker.on("failed", (job, err) => {
        console.error(`[SocialWorker] Job ${job?.id} failed with error:`, err.message);
    });
    return worker;
}
exports.createSocialJobWorker = createSocialJobWorker;
