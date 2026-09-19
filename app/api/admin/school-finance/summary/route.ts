/**
 * GET /api/admin/school-finance/summary?companyId=xxx&termId=xxx
 *
 * Provides a financial summary for the school:
 * totalBilled, totalCollected, outstanding, totalExpenses, netRevenue.
 */

import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { getFinancialSummary } from "@/lib/school/schoolService";
import { findCompanyCached } from "@/lib/company-fetcher";

export const GET = withApiHandler(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    let companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");
    const termId = searchParams.get("termId") || undefined;

    if (!companyId && slug) {
      const company = await findCompanyCached(slug);
      if (company) companyId = company.id;
    }

    if (!companyId) {
      return formatResponse(false, null, "companyId or slug is required", 400);
    }

    const summary = await getFinancialSummary(companyId, termId);
    return formatResponse(true, summary, "School financial summary retrieved", 200);
  },
  { requireAuth: true }
);
