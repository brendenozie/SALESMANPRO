/**
 * app/api/admin/payments/[id]/route.ts
 *
 * Detailed Payment Drilldown API.
 * Provides comprehensive transaction audit trail, order items, and fee breakdown.
 * Enforces tenant security.
 */

import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { canAccessCompanyAdmin } from "@/lib/auth/authorization";
import prisma from "@/server/db/prismadb";
import { getPaymentDetails } from "@/lib/payments/reportingService";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.user) {
      return formatResponse(false, null, auth.error || "Unauthorized", 401);
    }

    const { id: paymentId } = await params;

    if (!paymentId) {
      return formatResponse(false, null, "Missing payment ID", 400);
    }

    const isSuperAdmin = auth.user.role === "SUPER_ADMIN";

    // Call service which enforces store attribution access
    const details = await getPaymentDetails(
      paymentId,
      auth.user.companyId || null,
      isSuperAdmin
    );

    return formatResponse(true, details, "Payment details retrieved successfully");
  } catch (error: any) {
    const status = error.message?.includes("Forbidden")
      ? 403
      : error.message?.includes("not found")
      ? 404
      : 500;

    return formatResponse(false, null, error.message || "Failed to retrieve payment details", status);
  }
}
