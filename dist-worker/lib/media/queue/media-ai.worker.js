"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaAIWorker = exports.createMediaAIWorker = void 0;
const bullmq_1 = require("bullmq");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const client_1 = require("@prisma/client");
const action_router_1 = require("../action-router");
const openai_1 = require("../providers/openai");
// Register providers
action_router_1.aiRouter.register(new openai_1.OpenAIImageProvider());
const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
};
const isBuildPhase = process.env.NEXT_IS_BUILD_PHASE === "true" ||
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build" ||
    process.env.NEXT_BUILD === "1" ||
    (Array.isArray(process.argv) && process.argv.some(arg => typeof arg === "string" && arg.includes("build")));
function createMediaAIWorker() {
    if (isBuildPhase)
        return null;
    return new bullmq_1.Worker("media-ai-jobs", async (job) => {
        const { mediaJobId } = job.data;
        // 1. Fetch Job & Context
        const mediaJob = await prismadb_1.default.mediaJob.findUnique({
            where: { id: mediaJobId },
            include: { media: true },
        });
        if (!mediaJob || !mediaJob.media)
            throw new Error("Job or Media not found");
        await prismadb_1.default.mediaJob.update({
            where: { id: mediaJobId },
            data: {
                status: client_1.MediaJobStatus.PROCESSING,
                progress: 10,
                startedAt: new Date(),
            },
        });
        try {
            // 2. Execute AI Action
            const result = await action_router_1.aiRouter.execute(mediaJob.action, mediaJob.config, {
                jobId: mediaJob.id,
                tenantId: mediaJob.companyId || undefined,
                mediaAsset: mediaJob.media,
            });
            await job.updateProgress(70);
            // 3. (Mock) Download result from provider & upload to your Storage Provider
            // const permanentUrl = await storageProvider.uploadFromUrl(result.url, ...);
            const permanentUrl = result.url;
            // 4. Create new Immutable Version
            const newVersion = await prismadb_1.default.mediaVersion.create({
                data: {
                    mediaId: mediaJob.mediaId,
                    parentVersionId: mediaJob.inputVersionId,
                    version: (await prismadb_1.default.mediaVersion.count({
                        where: { mediaId: mediaJob.mediaId },
                    })) + 1,
                    source: "AI_GENERATED",
                    operation: mediaJob.action,
                    prompt: mediaJob.config?.prompt,
                    provider: result.provider,
                    model: result.model,
                    url: permanentUrl,
                    mimeType: result.mimeType,
                },
            });
            // 5. Update Asset and Job
            await prismadb_1.default.mediaAsset.update({
                where: { id: mediaJob.mediaId },
                data: { currentVersionId: newVersion.id },
            });
            await prismadb_1.default.mediaJob.update({
                where: { id: mediaJobId },
                data: {
                    status: client_1.MediaJobStatus.COMPLETED,
                    progress: 100,
                    completedAt: new Date(),
                    outputVersionId: newVersion.id,
                },
            });
        }
        catch (error) {
            await prismadb_1.default.mediaJob.update({
                where: { id: mediaJobId },
                data: {
                    status: client_1.MediaJobStatus.FAILED,
                    error: error.message,
                },
            });
            throw error;
        }
    }, { connection });
}
exports.createMediaAIWorker = createMediaAIWorker;
exports.mediaAIWorker = !isBuildPhase ? createMediaAIWorker() : null;
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
