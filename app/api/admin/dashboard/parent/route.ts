/**
 * GET /api/admin/dashboard/parent?companyId=xxx&parentId=xxx
 *
 * Parent dashboard data — live from DB.
 * Returns summary for each child: attendance, grades, fees, pending work.
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { findCompanyCached } from "@/lib/company-fetcher";
import { getParentChildrenSummaries } from "@/lib/school/schoolService";
import prisma from "@/server/db/prismadb";

export const GET = withApiHandler(
  async (request: NextRequest, context) => {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");
    const parentId = searchParams.get("parentId");

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

    // Resolve parent ID from user
    let resolvedParentId = parentId;
    if (!resolvedParentId && userId) {
      const parent = await prisma.parent.findFirst({
        where: { userId, companyId: resolvedCompanyId },
        select: { id: true },
      });
      resolvedParentId = parent?.id ?? null;
    }

    if (!resolvedParentId) {
      return formatResponse(false, null, "Parent profile not found", 404);
    }

    const summaries = await getParentChildrenSummaries(resolvedParentId, resolvedCompanyId);

    return formatResponse(true, summaries, "Parent dashboard data retrieved", 200);
  },
  { requireAuth: true }
);
