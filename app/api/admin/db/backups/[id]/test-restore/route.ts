/**
 * app/api/admin/db/backups/[id]/test-restore/route.ts
 *
 * POST: Runs an automated isolated restore test against a backup.
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
      const result = await backupService.testRestore(backupId);
      return formatResponse(true, result, "Restore test completed successfully", 200);
    } catch (err: any) {
      return formatResponse(false, null, `Restore test failed: ${err.message}`, 500);
    }
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  }
);
