/**
 * app/api/admin/db/backups/[id]/verify/route.ts
 *
 * POST: Trigger on-demand checksum and structure verification of a backup.
 */

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { backupService } from "@/lib/backup/backupService";
import { formatResponse } from "@/lib/formatResponse";

export const runtime = "nodejs";

export const POST = withApiHandler(
  async (req, context) => {
    const backupId = context.params?.id;

    if (!backupId) {
      return formatResponse(false, null, "Backup ID required", 400);
    }

    try {
      const result = await backupService.verifyBackup(backupId);
      return formatResponse(true, result, "Backup verified successfully", 200);
    } catch (err: any) {
      return formatResponse(false, null, `Verification failed: ${err.message}`, 400);
    }
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  }
);
