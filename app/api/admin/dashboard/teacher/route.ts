/**
 * GET /api/admin/dashboard/teacher?companyId=xxx&educatorId=xxx
 *
 * Teacher workload dashboard data — live from DB.
 * Returns: today's schedule, pending grading, recent submissions, class count.
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { findCompanyCached } from "@/lib/company-fetcher";
import { getTeacherWorkload } from "@/lib/school/schoolService";
import prisma from "@/server/db/prismadb";

export const GET = withApiHandler(
  async (request: NextRequest, context) => {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");
    const educatorId = searchParams.get("educatorId");

    // If educatorId not provided, look up by logged-in user
    const userId = context.user?.id;

    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId && slug) {
      const company = await findCompanyCached(slug);
      if (!company) return formatResponse(false, null, "Company not found", 404);
      resolvedCompanyId = company.id;
    }

    if (!resolvedCompanyId) {
      return formatResponse(false, null, "companyId or slug is required", 400);
    }

    // Resolve educator ID
    let resolvedEducatorId = educatorId;
    if (!resolvedEducatorId && userId) {
      // Look up educator profile by userId
      const educator = await prisma.educator.findFirst({
        where: { userId, companyId: resolvedCompanyId },
        select: { id: true },
      });
      resolvedEducatorId = educator?.id ?? null;
    }

    if (!resolvedEducatorId) {
      return formatResponse(false, null, "Teacher profile not found", 404);
    }

    const workload = await getTeacherWorkload(resolvedEducatorId, resolvedCompanyId);

    return formatResponse(true, workload, "Teacher dashboard data retrieved", 200);
  },
  { requireAuth: true }
);
