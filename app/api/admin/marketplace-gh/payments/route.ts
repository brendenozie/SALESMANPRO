/**
 * app/api/admin/marketplace-gh/payments/route.ts
 *
 * Dedicated Ghuba Marketplace Payment Intelligence API.
 * Provides GMV, gross store sales, Ghuba commissions/fees, net store amounts,
 * and store breakdown for marketplace operators.
 */

import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { getGhubaAdminMetrics, DatePeriod } from "@/lib/payments/reportingService";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.user) {
      return formatResponse(false, null, auth.error || "Unauthorized", 401);
    }

    // Role check: Only ADMIN and SUPER_ADMIN can access marketplace-wide financial metrics
    const role = (auth.user.role || "").toUpperCase();
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return formatResponse(
        false,
        null,
        "Forbidden: Insufficient privileges for Ghuba financial intelligence",
        403
      );
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") as DatePeriod) || "30days";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const metrics = await getGhubaAdminMetrics({
      period,
      startDate,
      endDate,
    });

    return formatResponse(true, metrics, "Ghuba payment intelligence retrieved successfully");
  } catch (error: any) {
    console.error("[GHUBA_PAYMENTS_API_ERROR]", error);
    return formatResponse(
      false,
      null,
      error.message || "Failed to retrieve Ghuba payment metrics",
      500
    );
  }
}
