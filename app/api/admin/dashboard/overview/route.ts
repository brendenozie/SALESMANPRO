/**
 * app/api/admin/dashboard/overview/route.ts
 *
 * Dedicated Multi-Store Business Intelligence & Portfolio Analytics Endpoint.
 *
 * Provides aggregated, period-filtered performance data, time-series trends,
 * top store rankings, operational alerts, and recent business activity across
 * all authorized stores for the authenticated administrator.
 */

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { getPortfolioDashboardData } from "@/lib/dashboard/portfolioService";

export const dynamic = "force-dynamic";

async function handleGet(request: Request, context: any) {
  const { user } = context;

  if (!user || !user.id) {
    return formatResponse(false, null, "Unauthorized: Authentication required", 401);
  }

  const url = new URL(request.url);
  const period = url.searchParams.get("period") || "last7days";
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const rankingMetric = url.searchParams.get("rankingMetric") || "revenue";
  const scope = url.searchParams.get("scope");
  const refresh = url.searchParams.get("refresh") === "true";

  try {
    const data = await getPortfolioDashboardData(user.id, user.role || "USER", {
      period,
      startDate,
      endDate,
      rankingMetric,
      scope,
      refresh,
    });

    return formatResponse(true, data, "Portfolio overview fetched successfully", 200);
  } catch (error: any) {
    console.error("[DashboardOverviewAPI] Error:", error);
    return formatResponse(
      false,
      null,
      error?.message || "Failed to generate portfolio overview",
      500,
    );
  }
}

export const GET = withApiHandler(handleGet, {
  requireAuth: true,
  requireRateLimit: true,
});
