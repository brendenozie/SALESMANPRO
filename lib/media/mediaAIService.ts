import prisma from "@/server/db/prismadb";
import { mediaAIQueue } from "./queues";
import { MediaAIAction } from "@prisma/client";
import { MediaAIConfig } from "./types";

export interface CreateMediaAIJobInput {
  userId: string;

  tenantId?: string;

  mediaId?: string;

  inputVersionId?: string;

  action: MediaAIAction;

  config: MediaAIConfig;
}

export async function createMediaAIJob(input: CreateMediaAIJobInput) {
  const job = await prisma.mediaJob.create({
    data: {
      mediaId: input.mediaId,
      inputVersionId: input.inputVersionId,

      action: input.action,

      status: "QUEUED",

      progress: 0,

      config: input.config,
    },
  });

  await mediaAIQueue.add(
    `media-ai:${job.id}`,
    {
      jobId: job.id,
      userId: input.userId,
      tenantId: input.tenantId,
    },
    {
      jobId: job.id,
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  );

  return job;
}
