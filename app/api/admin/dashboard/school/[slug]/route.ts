/**
 * GET /api/admin/dashboard/school/[slug]
 *
 * School Admin / Principal dashboard statistics by slug.
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { findCompanyCached } from "@/lib/company-fetcher";
import { getSchoolDashboardStats } from "@/lib/school/schoolService";

export const GET = withApiHandler(
  async (request: NextRequest, { params }: { params?: { slug?: string } }) => {
    const slug = params?.slug;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    let resolvedCompanyId = companyId;

    if (!resolvedCompanyId && slug) {
      const company = await findCompanyCached(slug);
      if (!company) {
        return formatResponse(false, null, "Company not found", 404);
      }
      resolvedCompanyId = company.id;
    }

    if (!resolvedCompanyId) {
      return formatResponse(false, null, "Company identifier required", 400);
    }

    const stats = await getSchoolDashboardStats(resolvedCompanyId);
    return formatResponse(true, stats, "School dashboard stats retrieved", 200);
  },
  { requireAuth: true }
);
