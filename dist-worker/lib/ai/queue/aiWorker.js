"use strict";
/**
 * lib/ai/queue/aiWorker.ts
 *
 * BullMQ Worker implementation for processing AI image & video generation jobs.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAIJobWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const aiQueue_1 = require("./aiQueue");
const videoProvider_1 = require("../providers/videoProvider");
const imageProvider_1 = require("../providers/imageProvider");
const modelRegistry_1 = require("../modelRegistry");
const creditLedger_1 = require("../creditLedger");
function createAIJobWorker() {
    const worker = new bullmq_1.Worker(aiQueue_1.AI_JOB_QUEUE_NAME, async (job) => {
        const { jobId, companyId, userId, capability, action, prompt, options, inputAssets } = job.data;
        console.log(`[AI_WORKER_JOB_START] Job ${jobId} (${capability}/${action}) for company ${companyId}`);
        const dbJob = await prismadb_1.default.aIGenerationJob.findUnique({
            where: { id: jobId },
        });
        if (!dbJob) {
            throw new Error(`AIGenerationJob ${jobId} not found`);
        }
        await prismadb_1.default.aIGenerationJob.update({
            where: { id: jobId },
            data: {
                status: "PROCESSING",
                progress: 15,
                startedAt: new Date(),
            },
        });
        try {
            if (capability === "VIDEO") {
                await job.updateProgress(30);
                // Generate or process video
                // Simulate / call provider rendering
                const duration = options?.durationSeconds || 5;
                const dummyVideoUrl = `https://${process.env.NEXT_PUBLIC_CDN_URL || "cdn.salesmanpro.com"}/videos/ai_${jobId}.mp4`;
                const dummyThumbUrl = `https://${process.env.NEXT_PUBLIC_CDN_URL || "cdn.salesmanpro.com"}/videos/ai_${jobId}_thumb.jpg`;
                await job.updateProgress(70);
                const { videoId, mediaAssetId } = await videoProvider_1.centralVideoProvider.completeVideoJob({
                    jobId,
                    videoUrl: dummyVideoUrl,
                    thumbnailUrl: dummyThumbUrl,
                    duration,
                    title: options?.title || prompt.slice(0, 50),
                });
                // Finalize ledger charge
                await creditLedger_1.creditLedger.finalizeCharge({
                    companyId,
                    userId,
                    reservedAmount: dbJob.creditsReserved,
                    actualAmount: dbJob.creditsReserved,
                    description: `Completed AI Video Generation (${dbJob.model})`,
                    referenceId: jobId,
                    usageData: {
                        capability: "VIDEO",
                        provider: dbJob.provider,
                        model: dbJob.model,
                        inputUnits: duration,
                        outputUnits: 1,
                        source: "WORKER",
                        feature: action,
                    },
                });
                await job.updateProgress(100);
                console.log(`[AI_WORKER_VIDEO_COMPLETED] Video ${videoId} created for job ${jobId}`);
            }
            else if (capability === "IMAGE") {
                await job.updateProgress(40);
                const model = modelRegistry_1.modelRegistry.getModel(dbJob.model);
                const imageResult = await imageProvider_1.centralImageProvider.execute(model, {
                    prompt,
                    aspectRatio: options?.aspectRatio || "1:1",
                    style: options?.style || "vivid",
                    action: action,
                    productId: inputAssets?.productId,
                    marketplaceListingId: inputAssets?.marketplaceListingId,
                }, { companyId, userId });
                await job.updateProgress(80);
                const firstImg = imageResult.images[0];
                await prismadb_1.default.aIGenerationJob.update({
                    where: { id: jobId },
                    data: {
                        status: "COMPLETED",
                        progress: 100,
                        completedAt: new Date(),
                        mediaAssetId: firstImg?.mediaAssetId,
                        outputAssets: {
                            images: imageResult.images,
                        },
                    },
                });
                await creditLedger_1.creditLedger.finalizeCharge({
                    companyId,
                    userId,
                    reservedAmount: dbJob.creditsReserved,
                    actualAmount: imageResult.creditsConsumed,
                    description: `Completed AI Image Generation (${dbJob.model})`,
                    referenceId: jobId,
                    usageData: {
                        capability: "IMAGE",
                        provider: dbJob.provider,
                        model: dbJob.model,
                        inputUnits: imageResult.images.length,
                        outputUnits: imageResult.images.length,
                        source: "WORKER",
                        feature: action,
                    },
                });
                await job.updateProgress(100);
                console.log(`[AI_WORKER_IMAGE_COMPLETED] Image job ${jobId} completed`);
            }
        }
        catch (error) {
            console.error(`[AI_WORKER_JOB_ERROR] Job ${jobId} failed:`, error);
            await prismadb_1.default.aIGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: "FAILED",
                    error: error.message || "Worker processing error",
                },
            });
            // Refund reserved credits
            await creditLedger_1.creditLedger.refundCredits({
                companyId,
                userId,
                amount: dbJob.creditsReserved,
                description: `Refund for failed AI generation job ${jobId}: ${error.message || "Error"}`,
                referenceId: jobId,
            });
            throw error;
        }
    }, {
        connection: redis_1.redisConnection,
        concurrency: 3,
    });
    worker.on("error", (err) => {
        console.error("[AI_WORKER_REDIS_ERROR] BullMQ worker connection error:", err.message);
    });
    worker.on("failed", (job, err) => {
        console.error(`[AI_WORKER_FAILED] Job ${job?.id} error:`, err);
    });
    return worker;
}
exports.createAIJobWorker = createAIJobWorker;
