import { Worker, Job } from "bullmq";
import prisma from "@/server/db/prismadb";
import { MediaJobStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { MediaAIAction } from "@prisma/client";
import { aiRouter } from "../action-router";
import { OpenAIImageProvider } from "../providers/openai";
import { enqueueAIJob } from "./queue";

// Register providers
aiRouter.register(new OpenAIImageProvider());

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

export const mediaAIWorker = new Worker(
  "media-ai-jobs",
  async (job: Job) => {
    const { mediaJobId } = job.data;

    // 1. Fetch Job & Context
    const mediaJob = await prisma.mediaJob.findUnique({
      where: { id: mediaJobId },
      include: { media: true },
    });

    if (!mediaJob || !mediaJob.media) throw new Error("Job or Media not found");

    await prisma.mediaJob.update({
      where: { id: mediaJobId },
      data: {
        status: MediaJobStatus.PROCESSING,
        progress: 10,
        startedAt: new Date(),
      },
    });

    try {
      // 2. Execute AI Action
      const result = await aiRouter.execute(
        mediaJob.action,
        mediaJob.config as any,
        {
          jobId: mediaJob.id,
          tenantId: mediaJob.companyId || undefined,
          mediaAsset: mediaJob.media,
        },
      );

      await job.updateProgress(70);

      // 3. (Mock) Download result from provider & upload to your Storage Provider
      // const permanentUrl = await storageProvider.uploadFromUrl(result.url, ...);
      const permanentUrl = result.url;

      // 4. Create new Immutable Version
      const newVersion = await prisma.mediaVersion.create({
        data: {
          mediaId: mediaJob.mediaId!,
          parentVersionId: mediaJob.inputVersionId,
          version:
            (await prisma.mediaVersion.count({
              where: { mediaId: mediaJob.mediaId! },
            })) + 1,
          source: "AI_GENERATED",
          operation: mediaJob.action,
          prompt: (mediaJob.config as any)?.prompt,
          provider: result.provider,
          model: result.model,
          url: permanentUrl,
          mimeType: result.mimeType,
        },
      });

      // 5. Update Asset and Job
      await prisma.mediaAsset.update({
        where: { id: mediaJob.mediaId! },
        data: { currentVersionId: newVersion.id },
      });

      await prisma.mediaJob.update({
        where: { id: mediaJobId },
        data: {
          status: MediaJobStatus.COMPLETED,
          progress: 100,
          completedAt: new Date(),
          outputVersionId: newVersion.id,
        },
      });
    } catch (error: any) {
      await prisma.mediaJob.update({
        where: { id: mediaJobId },
        data: {
          status: MediaJobStatus.FAILED,
          error: error.message,
        },
      });
      throw error;
    }
  },
  { connection },
);


// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { mediaId, inputVersionId, action, config, companyId } = body;

//     // 1. Validation & Auth (Assume user is verified here)
//     if (!mediaId || !action) {
//       return NextResponse.json(
//         { error: "Missing parameters" },
//         { status: 400 },
//       );
//     }

//     // 2. Create the Job
//     const job = await prisma.mediaJob.create({
//       data: {
//         mediaId,
//         inputVersionId,
//         action: action as MediaAIAction,
//         config,
//         companyId,
//       },
//     });

//     // 3. Enqueue to BullMQ
//     await enqueueAIJob(job.id, { mediaJobId: job.id });

//     // 4. Return fast response
//     return NextResponse.json({
//       success: true,
//       job: {
//         id: job.id,
//         status: job.status,
//         progress: job.progress,
//       },
//     });
//   } catch (error) {
//     console.error("AI Job Creation Failed:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }