/**
 * GET /api/admin/report-card/bulk?classroomId=xxx&termId=xxx&companyId=xxx
 *
 * Generate report cards for all students in a classroom for a given term.
 * Returns an array sorted by class rank (highest to lowest).
 * 
 * NOTE: For large classes (50+), consider running this as a background job.
 * For now it runs synchronously; BullMQ job can wrap this for async delivery.
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { bulkGenerateReportCards } from "@/lib/school/schoolService";

export const GET = withApiHandler(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const termId = searchParams.get("termId");
    const companyId = searchParams.get("companyId");

    if (!classroomId || !termId || !companyId) {
      return formatResponse(
        false,
        null,
        "classroomId, termId, and companyId are required",
        400
      );
    }

    const reportCards = await bulkGenerateReportCards(classroomId, termId, companyId);

    return formatResponse(
      true,
      { count: reportCards.length, reportCards },
      `${reportCards.length} report cards generated`,
      200
    );
  },
  { requireAuth: true }
);
