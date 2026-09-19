/**
 * GET /api/admin/report-card?studentId=xxx&termId=xxx&companyId=xxx
 *
 * Generate a single student's complete report card from authoritative grade records.
 * This is a READ operation — it does NOT create any DB records.
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { generateReportCard } from "@/lib/school/schoolService";

export const GET = withApiHandler(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const termId = searchParams.get("termId");
    const companyId = searchParams.get("companyId");

    if (!studentId || !termId || !companyId) {
      return formatResponse(
        false,
        null,
        "studentId, termId, and companyId are required",
        400
      );
    }

    const reportCard = await generateReportCard(studentId, termId, companyId);

    return formatResponse(true, reportCard, "Report card generated", 200);
  },
  { requireAuth: true }
);
