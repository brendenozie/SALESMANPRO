/**
 * app/api/admin/payments/route.ts
 *
 * Primary Store Payments API.
 * Secure multi-tenant endpoint for store administrators to query their authoritative
 * payment metrics and paginated transaction history.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { canAccessCompanyAdmin } from "@/lib/auth/authorization";
import prisma from "@/server/db/prismadb";
import {
  getStorePaymentMetrics,
  getStorePaymentTransactions,
  DatePeriod,
} from "@/lib/payments/reportingService";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.user) {
      return formatResponse(false, null, auth.error || "Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const requestedCompanyId = searchParams.get("companyId");

    if (!requestedCompanyId) {
      return formatResponse(false, null, "Missing required companyId parameter", 400);
    }

    // Resolve company and verify tenant authorization
    const company = await prisma.company.findUnique({
      where: { id: requestedCompanyId },
      select: { id: true, userId: true, name: true, slug: true },
    });

    if (!company) {
      return formatResponse(false, null, "Store not found", 404);
    }

    const staff = await prisma.staffProfile.findUnique({
      where: { userId: auth.user.id },
      select: { companyId: true },
    });

    const isAuthorized =
      auth.user.role === "SUPER_ADMIN" ||
      canAccessCompanyAdmin({
        user: {
          id: auth.user.id,
          role: auth.user.role,
          companyId: auth.user.companyId,
          emailVerified: auth.user.emailVerified,
          isActive: auth.user.isActive,
        },
        company: { id: company.id, userId: company.userId },
        staffCompanyId: staff?.companyId,
      });

    if (!isAuthorized) {
      return formatResponse(
        false,
        null,
        "Forbidden: You do not have access to this store's financial data",
        403
      );
    }

    // Extract filters
    const period = (searchParams.get("period") as DatePeriod) || "30days";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const status = searchParams.get("status") || undefined;
    const channel = searchParams.get("channel") || undefined;
    const provider = searchParams.get("provider") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const pageSize = parseInt(searchParams.get("pageSize") || "25", 10) || 25;

    const filter = { period, startDate, endDate };

    // Concurrently fetch store metrics and paginated transactions
    const [metrics, transactionData] = await Promise.all([
      getStorePaymentMetrics(company.id, filter),
      getStorePaymentTransactions({
        companyId: company.id,
        period,
        startDate,
        endDate,
        status,
        channel,
        provider,
        search,
        page,
        pageSize,
      }),
    ]);

    return formatResponse(
      true,
      {
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
        },
        metrics,
        transactions: transactionData.transactions,
        pagination: transactionData.pagination,
      },
      "Store payment data retrieved successfully"
    );
  } catch (error: any) {
    console.error("[STORE_PAYMENTS_API_ERROR]", error);
    return formatResponse(
      false,
      null,
      error.message || "Failed to retrieve store payments",
      500
    );
  }
}
