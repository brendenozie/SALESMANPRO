"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueAIJob = exports.mediaAIQueue = void 0;
const bullmq_1 = require("bullmq");
const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
};
exports.mediaAIQueue = new bullmq_1.Queue("media-ai-jobs", { connection });
async function enqueueAIJob(jobId, payload) {
    return exports.mediaAIQueue.add("execute-ai", payload, {
        jobId,
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
    });
}
exports.enqueueAIJob = enqueueAIJob;
