/**
 * app/api/admin/db/health/route.ts
 *
 * GET: Returns system-wide backup reliability health, SLA adherence, and RPO/RTO metrics.
 */

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { backupService } from "@/lib/backup/backupService";
import { formatResponse } from "@/lib/formatResponse";

export const runtime = "nodejs";

export const GET = withApiHandler(
  async (req, context) => {
    try {
      const summary = await backupService.getHealthSummary();
      return formatResponse(true, summary, "Backup health status retrieved", 200);
    } catch (err: any) {
      return formatResponse(false, null, `Health evaluation failed: ${err.message}`, 500);
    }
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  }
);
