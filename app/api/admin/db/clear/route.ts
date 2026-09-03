/**
 * app/api/admin/db/clear/route.ts
 *
 * POST: Dangerous Administrative Database Wipe.
 * Protected by:
 * 1. Strict SUPER_ADMIN authentication
 * 2. Exact confirmation phrase: "DELETE PRODUCTION DATABASE"
 * 3. Mandatory emergency verified pre-wipe backup
 * 4. Exclusive distributed locking
 */

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { backupService } from "@/lib/backup/backupService";
import { formatResponse } from "@/lib/formatResponse";

export const runtime = "nodejs";

export const POST = withApiHandler(
  async (req, context) => {
    const body = await req.json().catch(() => ({}));
    const { confirmation } = body;

    if (!confirmation || confirmation !== "DELETE PRODUCTION DATABASE") {
      return formatResponse(
        false,
        null,
        "Safety validation failed: You must provide the exact confirmation phrase 'DELETE PRODUCTION DATABASE'",
        400
      );
    }

    const requestedBy = context.user?.email || context.user?.id || "super-admin";

    try {
      const result = await backupService.wipeDatabase(confirmation, requestedBy);
      return formatResponse(
        true,
        result,
        "Database wiped clean. Emergency pre-wipe backup was created and verified.",
        200
      );
    } catch (err: any) {
      return formatResponse(false, null, `Wipe failed: ${err.message}`, 500);
    }
  },
  {
    requireAuth: true,
    allowedRoles: ["SUPER_ADMIN"],
    timeoutMs: 60_000,
  }
);
