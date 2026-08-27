import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";

export const mediaAIQueue = new Queue("media-ai", {
  connection: redisConnection,
});

export const mediaProcessingQueue = new Queue("media-processing", {
  connection: redisConnection,
});

export const mediaMetadataQueue = new Queue("media-metadata", {
  connection: redisConnection,
});
