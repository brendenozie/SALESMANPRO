"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMediaAIJob = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const queues_1 = require("./queues");
async function createMediaAIJob(input) {
    const job = await prismadb_1.default.mediaJob.create({
        data: {
            mediaId: input.mediaId,
            inputVersionId: input.inputVersionId,
            action: input.action,
            status: "QUEUED",
            progress: 0,
            config: input.config,
        },
    });
    await queues_1.mediaAIQueue.add(`media-ai:${job.id}`, {
        jobId: job.id,
        userId: input.userId,
        tenantId: input.tenantId,
    }, {
        jobId: job.id,
        removeOnComplete: 1000,
        removeOnFail: 5000,
    });
    return job;
}
exports.createMediaAIJob = createMediaAIJob;
