/**
 * app/api/super-admin/payments/route.ts
 *
 * SalesmanPro Platform Super Admin Payment Intelligence API.
 * Provides global visibility across all stores, channels, providers, and Ghuba.
 * Strictly restricted to platform SUPER_ADMIN role.
 */

import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { getPlatformPaymentMetrics, DatePeriod } from "@/lib/payments/reportingService";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.user) {
      return formatResponse(false, null, auth.error || "Unauthorized", 401);
    }

    const role = (auth.user.role || "").toUpperCase();
    if (role !== "SUPER_ADMIN") {
      return formatResponse(
        false,
        null,
        "Forbidden: Only SalesmanPro Super Administrators can access global platform payments",
        403
      );
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") as DatePeriod) || "30days";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const metrics = await getPlatformPaymentMetrics({
      period,
      startDate,
      endDate,
    });

    return formatResponse(true, metrics, "Global platform payment metrics retrieved successfully");
  } catch (error: any) {
    console.error("[SUPER_ADMIN_PAYMENTS_API_ERROR]", error);
    return formatResponse(
      false,
      null,
      error.message || "Failed to retrieve platform payment intelligence",
      500
    );
  }
}
