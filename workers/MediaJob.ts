import { Worker } from "bullmq";

import { prisma } from "@/lib/prisma";

import { redisConnection } from "@/lib/redis";

import { mediaAIRouter } from "@/lib/media/ai";

export const mediaAIWorker = new Worker(
  "media-ai",

  async (job) => {
    const { jobId, userId, tenantId } = job.data;

    const mediaJob = await prisma.mediaJob.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!mediaJob) {
      throw new Error(`Media job ${jobId} not found`);
    }

    await prisma.mediaJob.update({
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
        ? await prisma.mediaAsset.findUnique({
            where: {
              id: mediaJob.mediaId,
            },
          })
        : undefined;

      const inputVersion = mediaJob.inputVersionId
        ? await prisma.mediaVersion.findUnique({
            where: {
              id: mediaJob.inputVersionId,
            },
          })
        : undefined;

      const result = await mediaAIRouter.execute(
        mediaJob.action,
        mediaJob.config as any,
        {
          userId,
          tenantId,
          media: media as any,
          inputVersion: inputVersion as any,
        },
      );

      await prisma.mediaJob.update({
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
    } catch (error) {
      await prisma.mediaJob.update({
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
  },

  {
    connection: redisConnection,
    concurrency: 3,
  },
);
