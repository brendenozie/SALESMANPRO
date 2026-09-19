/**
 * GET /api/admin/dashboard/school?companyId=xxx
 *
 * School Admin / Principal dashboard statistics.
 * Returns live aggregated data from DB — no hardcoded fallbacks.
 */

import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { findCompanyCached } from "@/lib/company-fetcher";
import { getSchoolDashboardStats } from "@/lib/school/schoolService";

export const GET = withApiHandler(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");

    if (!companyId && !slug) {
      return formatResponse(false, null, "companyId or slug is required", 400);
    }

    let resolvedCompanyId = companyId;

    if (!resolvedCompanyId && slug) {
      const company = await findCompanyCached(slug);
      if (!company) {
        return formatResponse(false, null, "Company not found", 404);
      }
      resolvedCompanyId = company.id;
    }

    const stats = await getSchoolDashboardStats(resolvedCompanyId!);

    return formatResponse(true, stats, "School dashboard stats retrieved", 200);
  },
  { requireAuth: true }
);
