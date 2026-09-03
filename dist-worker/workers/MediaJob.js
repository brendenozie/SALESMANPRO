"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaAIWorker = void 0;
const bullmq_1 = require("bullmq");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const redis_1 = require("@/lib/redis");
const action_router_1 = require("@/lib/media/action-router");
exports.mediaAIWorker = new bullmq_1.Worker("media-ai", async (job) => {
    const { jobId, userId, tenantId } = job.data;
    const mediaJob = await prismadb_1.default.mediaJob.findUnique({
        where: {
            id: jobId,
        },
    });
    if (!mediaJob) {
        throw new Error(`Media job ${jobId} not found`);
    }
    await prismadb_1.default.mediaJob.update({
        where: {
            id: jobId,
        },
        data: {
            status: "PROCESSING",
            startedAt: new Date(),
            progress: 10,
        },
    });
    try {
        const media = mediaJob.mediaId
            ? await prismadb_1.default.mediaAsset.findUnique({
                where: {
                    id: mediaJob.mediaId,
                },
            })
            : undefined;
        const inputVersion = mediaJob.inputVersionId
            ? await prismadb_1.default.mediaVersion.findUnique({
                where: {
                    id: mediaJob.inputVersionId,
                },
            })
            : undefined;
        const result = await action_router_1.aiRouter.execute(mediaJob.action, mediaJob.config, {
            jobId,
            userId,
            tenantId,
            mediaAsset: media,
            inputVersion: inputVersion,
        });
        await prismadb_1.default.mediaJob.update({
            where: {
                id: jobId,
            },
            data: {
                status: "COMPLETED",
                progress: 100,
                completedAt: new Date(),
            },
        });
        return result;
    }
    catch (error) {
        await prismadb_1.default.mediaJob.update({
            where: {
                id: jobId,
            },
            data: {
                status: "FAILED",
                error: error instanceof Error ? error.message : "Unknown AI error",
            },
        });
        throw error;
    }
}, {
    connection: redis_1.redisConnection,
    concurrency: 3,
});
