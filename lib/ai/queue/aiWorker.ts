/**
 * lib/ai/queue/aiWorker.ts
 *
 * BullMQ Worker implementation for processing AI image & video generation jobs.
 */

import { Worker, Job } from "bullmq";
import { redisConnection } from "@/lib/redis";
import prisma from "@/server/db/prismadb";
import { AI_JOB_QUEUE_NAME, AIJobData } from "./aiQueue";
import { centralVideoProvider } from "../providers/videoProvider";
import { centralImageProvider } from "../providers/imageProvider";
import { modelRegistry } from "../modelRegistry";
import { creditLedger } from "../creditLedger";

export function createAIJobWorker() {
  const worker = new Worker<AIJobData>(
    AI_JOB_QUEUE_NAME,
    async (job: Job<AIJobData>) => {
      const { jobId, companyId, userId, capability, action, prompt, options, inputAssets } = job.data;

      console.log(`[AI_WORKER_JOB_START] Job ${jobId} (${capability}/${action}) for company ${companyId}`);

      const dbJob = await prisma.aIGenerationJob.findUnique({
        where: { id: jobId },
      });

      if (!dbJob) {
        throw new Error(`AIGenerationJob ${jobId} not found`);
      }

      await prisma.aIGenerationJob.update({
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
          const duration = (options?.durationSeconds as number) || 5;
          const dummyVideoUrl = `https://${process.env.NEXT_PUBLIC_CDN_URL || "cdn.salesmanpro.com"}/videos/ai_${jobId}.mp4`;
          const dummyThumbUrl = `https://${process.env.NEXT_PUBLIC_CDN_URL || "cdn.salesmanpro.com"}/videos/ai_${jobId}_thumb.jpg`;

          await job.updateProgress(70);

          const { videoId, mediaAssetId } = await centralVideoProvider.completeVideoJob({
            jobId,
            videoUrl: dummyVideoUrl,
            thumbnailUrl: dummyThumbUrl,
            duration,
            title: (options?.title as string) || prompt.slice(0, 50),
          });

          // Finalize ledger charge
          await creditLedger.finalizeCharge({
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
        } else if (capability === "IMAGE") {
          await job.updateProgress(40);
          const model = modelRegistry.getModel(dbJob.model);

          const imageResult = await centralImageProvider.execute(
            model,
            {
              prompt,
              aspectRatio: (options?.aspectRatio as any) || "1:1",
              style: (options?.style as any) || "vivid",
              action: action as any,
              productId: inputAssets?.productId as string,
              marketplaceListingId: inputAssets?.marketplaceListingId as string,
            },
            { companyId, userId },
          );

          await job.updateProgress(80);

          const firstImg = imageResult.images[0];

          await prisma.aIGenerationJob.update({
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

          await creditLedger.finalizeCharge({
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
      } catch (error: any) {
        console.error(`[AI_WORKER_JOB_ERROR] Job ${jobId} failed:`, error);

        await prisma.aIGenerationJob.update({
          where: { id: jobId },
          data: {
            status: "FAILED",
            error: error.message || "Worker processing error",
          },
        });

        // Refund reserved credits
        await creditLedger.refundCredits({
          companyId,
          userId,
          amount: dbJob.creditsReserved,
          description: `Refund for failed AI generation job ${jobId}: ${error.message || "Error"}`,
          referenceId: jobId,
        });

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 3,
    },
  );

  worker.on("failed", (job, err) => {
    console.error(`[AI_WORKER_FAILED] Job ${job?.id} error:`, err);
  });

  return worker;
}
