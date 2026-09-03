"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaMetadataQueue = exports.mediaProcessingQueue = exports.mediaAIQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("@/lib/redis");
exports.mediaAIQueue = new bullmq_1.Queue("media-ai", {
    connection: redis_1.redisConnection,
});
exports.mediaProcessingQueue = new bullmq_1.Queue("media-processing", {
    connection: redis_1.redisConnection,
});
exports.mediaMetadataQueue = new bullmq_1.Queue("media-metadata", {
    connection: redis_1.redisConnection,
});
