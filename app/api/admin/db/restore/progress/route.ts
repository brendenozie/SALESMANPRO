/**
 * app/api/admin/db/restore/progress/route.ts
 *
 * GET: Retrieve progress of a restore job by ID.
 * Reads persistently from MongoDB DatabaseRestoreJob.
 */

import prisma from "@/server/db/prismadb";
import { getProgress } from "@/lib/restoreProgress";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Missing restore id" }, { status: 400 });
  }

  // 1. Check MongoDB DatabaseRestoreJob first (durable progress)
  const job = await prisma.databaseRestoreJob.findUnique({
    where: { id },
  });

  if (job) {
    return Response.json({
      success: true,
      progress: {
        id: job.id,
        status: job.status,
        currentModel: job.currentCollection || "Initializing",
        total: job.collectionsTotal || 0,
        completed: job.collectionsDone || 0,
        progressPercent: job.progressPercent || 0,
        recordsProcessed: job.recordsProcessed ? Number(job.recordsProcessed) : 0,
        recordsTotal: job.recordsTotal ? Number(job.recordsTotal) : 0,
        done: job.status === "COMPLETED" || job.status === "FAILED",
        error: job.errorMessage,
      },
    });
  }

  // 2. In-memory fallback
  const memProgress = getProgress(id);
  if (memProgress) {
    return Response.json({
      success: true,
      progress: memProgress,
    });
  }

  return Response.json({
    success: false,
    message: "Restore job not found",
  }, { status: 404 });
}