import { Queue } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

export const mediaAIQueue = new Queue("media-ai-jobs", { connection });

export async function enqueueAIJob(jobId: string, payload: any) {
  return mediaAIQueue.add("execute-ai", payload, {
    jobId,
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  });
}
