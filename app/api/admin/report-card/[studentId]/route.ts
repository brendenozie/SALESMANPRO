/**
 * GET /api/admin/report-card/[studentId]?termId=xxx&companyId=xxx
 *
 * Generate report card for student specified in route parameter.
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { generateReportCard } from "@/lib/school/schoolService";
import { findCompanyCached } from "@/lib/company-fetcher";

export const GET = withApiHandler(
  async (request: NextRequest, { params }: { params?: { studentId?: string } }) => {
    const studentId = params?.studentId;
    const { searchParams } = new URL(request.url);
    const termId = searchParams.get("termId");
    let companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");

    if (!companyId && slug) {
      const comp = await findCompanyCached(slug);
      if (comp) companyId = comp.id;
    }

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
