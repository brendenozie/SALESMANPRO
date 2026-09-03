/**
 * app/api/admin/db/restores/[id]/route.ts
 *
 * GET: Poll live progress and outcome of a durable restore job from MongoDB.
 */

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export const runtime = "nodejs";

export const GET = withApiHandler(
  async (req, context) => {
    const restoreJobId = context.params?.id;

    if (!restoreJobId) {
      return formatResponse(false, null, "Restore Job ID required", 400);
    }

    const job = await prisma.databaseRestoreJob.findUnique({
      where: { id: restoreJobId },
    });

    if (!job) {
      return formatResponse(false, null, "Restore job not found", 404);
    }

    const formatted = {
      ...job,
      recordsTotal: job.recordsTotal ? Number(job.recordsTotal) : 0,
      recordsProcessed: job.recordsProcessed ? Number(job.recordsProcessed) : 0,
      recordsRestored: job.recordsRestored ? Number(job.recordsRestored) : 0,
      recordsSkipped: job.recordsSkipped ? Number(job.recordsSkipped) : 0,
      recordsFailed: job.recordsFailed ? Number(job.recordsFailed) : 0,
    };

    return formatResponse(true, { job: formatted }, "Restore job status", 200);
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  }
);
