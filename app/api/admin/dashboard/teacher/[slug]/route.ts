/**
 * GET /api/admin/dashboard/teacher/[slug]
 *
 * Teacher workload dashboard data by slug.
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { findCompanyCached } from "@/lib/company-fetcher";
import { getTeacherWorkload } from "@/lib/school/schoolService";
import prisma from "@/server/db/prismadb";

export const GET = withApiHandler(
  async (request: any, context: any) => {
    const slug = context?.params?.slug;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const educatorId = searchParams.get("educatorId");
    const userId = searchParams.get("userId") || context?.user?.id;

    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId && slug) {
      const company = await findCompanyCached(slug);
      if (!company) return formatResponse(false, null, "Company not found", 404);
      resolvedCompanyId = company.id;
    }

    if (!resolvedCompanyId) {
      return formatResponse(false, null, "companyId or slug is required", 400);
    }

    let resolvedEducatorId = educatorId;
    if (!resolvedEducatorId && userId) {
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
