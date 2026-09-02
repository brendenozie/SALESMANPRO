/**
 * lib/social/queue/socialWorker.ts
 *
 * BullMQ Worker for processing scheduled social media posts and retries.
 */

import { Worker, Job } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { SOCIAL_QUEUE_NAME, SocialJobData } from "./socialQueue";
import { socialService } from "../socialService";

export function createSocialJobWorker(): Worker<SocialJobData> {
  const worker = new Worker<SocialJobData>(
    SOCIAL_QUEUE_NAME,
    async (job: Job<SocialJobData>) => {
      const { companyId, postId, publicationId, action } = job.data;
      console.log(`[SocialWorker] Processing job ${job.id} for company ${companyId}, action: ${action || "PUBLISH"}`);

      try {
        if (action === "RETRY_PUBLICATION" && publicationId) {
          await socialService.retryPublication(companyId, publicationId);
        } else if (postId) {
          await socialService.publishNow(companyId, postId);
        }
      } catch (err: any) {
        console.error(`[SocialWorker] Job ${job.id} failed:`, err);
        throw err;
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[SocialWorker] Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[SocialWorker] Job ${job?.id} failed with error:`, err.message);
  });

  return worker;
}
