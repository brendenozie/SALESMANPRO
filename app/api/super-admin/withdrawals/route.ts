/**
 * app/api/super-admin/withdrawals/route.ts
 *
 * Platform Super Admin Global Withdrawal Queue & Settlement Management API.
 * Provides platform-wide queue of withdrawal requests with multi-store filtering,
 * aggregation metrics, and audit tracking.
 * Strictly restricted to SalesmanPro SUPER_ADMIN.
 */

import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { WithdrawalStatus } from "@prisma/client";

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
        "Forbidden: Only SalesmanPro Super Administrators can access the global withdrawal queue",
        403
      );
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") || "ALL";
    const companyId = searchParams.get("companyId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const pageSize = parseInt(searchParams.get("pageSize") || "25", 10) || 25;

    const where: any = {};

    if (statusParam !== "ALL") {
      where.status = statusParam as WithdrawalStatus;
    }

    if (companyId && companyId !== "ALL") {
      where.companyId = companyId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { reference: { contains: q, mode: "insensitive" } },
        { providerReference: { contains: q, mode: "insensitive" } },
        { company: { name: { contains: q, mode: "insensitive" } } },
        { requestedBy: { name: { contains: q, mode: "insensitive" } } },
        { requestedBy: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    // Parallel fetch of count, records, and global aggregates
    const [totalCount, records, allWithdrawals] = await Promise.all([
      prisma.withdrawalRequest.count({ where }),
      prisma.withdrawalRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          company: { select: { id: true, name: true, slug: true } },
          requestedBy: { select: { id: true, name: true, email: true, phone: true } },
          reviewedBy: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.withdrawalRequest.findMany({
        select: {
          amount: true,
          status: true,
        },
      }),
    ]);

    // Aggregate summary metrics across all requests
    let totalPendingAmount = 0;
    let totalPaidAmount = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let paidCount = 0;
    let rejectedCount = 0;

    for (const w of allWithdrawals) {
      if (w.status === WithdrawalStatus.REQUESTED || w.status === WithdrawalStatus.UNDER_REVIEW) {
        pendingCount += 1;
        totalPendingAmount += w.amount;
      } else if (w.status === WithdrawalStatus.APPROVED || w.status === WithdrawalStatus.PROCESSING) {
        approvedCount += 1;
        totalPendingAmount += w.amount;
      } else if (w.status === WithdrawalStatus.PAID) {
        paidCount += 1;
        totalPaidAmount += w.amount;
      } else if (w.status === WithdrawalStatus.REJECTED || w.status === WithdrawalStatus.CANCELLED) {
        rejectedCount += 1;
      }
    }

    return formatResponse(
      true,
      {
        withdrawals: records,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize) || 1,
        },
        stats: {
          totalPendingAmount: Math.round(totalPendingAmount * 100) / 100,
          totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
          pendingCount,
          approvedCount,
          paidCount,
          rejectedCount,
          totalRequests: allWithdrawals.length,
        },
      },
      "Global withdrawal queue retrieved successfully"
    );
  } catch (error: any) {
    console.error("[SUPER_ADMIN_WITHDRAWALS_GET_ERROR]", error);
    return formatResponse(
      false,
      null,
      error.message || "Failed to retrieve global withdrawal queue",
      500
    );
  }
}
