/**
 * app/api/admin/db/restores/route.ts
 *
 * GET: List restore jobs history.
 * POST: Enqueue a disaster recovery restore job.
 */

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import prisma from "@/server/db/prismadb";
import { backupService } from "@/lib/backup/backupService";
import { formatResponse } from "@/lib/formatResponse";
import { RestoreMode } from "@/lib/backup/types";

export const runtime = "nodejs";

export const GET = withApiHandler(
  async (req, context) => {
    const jobs = await prisma.databaseRestoreJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const formatted = jobs.map((j) => ({
      ...j,
      recordsTotal: j.recordsTotal ? Number(j.recordsTotal) : 0,
      recordsProcessed: j.recordsProcessed ? Number(j.recordsProcessed) : 0,
      recordsRestored: j.recordsRestored ? Number(j.recordsRestored) : 0,
      recordsSkipped: j.recordsSkipped ? Number(j.recordsSkipped) : 0,
      recordsFailed: j.recordsFailed ? Number(j.recordsFailed) : 0,
    }));

    return formatResponse(true, { jobs: formatted }, "Restore jobs retrieved", 200);
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  }
);

export const POST = withApiHandler(
  async (req, context) => {
    const body = await req.json();
    const { backupId, mode, confirmation } = body;

    if (!backupId) {
      return formatResponse(false, null, "backupId is required", 400);
    }

    const restoreMode = (mode || "RESTORE_TO_PRODUCTION") as RestoreMode;

    // Production overwrite safety check
    if (restoreMode === "RESTORE_TO_PRODUCTION") {
      if (confirmation !== "RESTORE PRODUCTION DATABASE") {
        return formatResponse(
          false,
          null,
          "Production restore requires typing exact confirmation phrase: 'RESTORE PRODUCTION DATABASE'",
          400
        );
      }
    }

    const requestedBy = context.user?.email || context.user?.id || "admin";

    try {
      const job = await backupService.triggerRestore(backupId, restoreMode, requestedBy);
      return formatResponse(
        true,
        {
          restoreJob: {
            ...job,
            recordsTotal: job.recordsTotal ? Number(job.recordsTotal) : 0,
            recordsProcessed: job.recordsProcessed ? Number(job.recordsProcessed) : 0,
          },
        },
        "Restore job created and enqueued successfully",
        202
      );
    } catch (err: any) {
      return formatResponse(false, null, `Failed to trigger restore: ${err.message}`, 400);
    }
  },
  {
    requireAuth: true,
    allowedRoles: ["SUPER_ADMIN"], // Only SUPER_ADMIN can trigger restores
  }
);
