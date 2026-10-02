/**
 * app/api/super-admin/transactions/route.ts
 *
 * Super Admin Global Transaction Explorer API.
 * Provides cross-tenant payment search, multi-gateway filtering,
 * and comprehensive audit inspection across the entire SalesmanPro ecosystem.
 * Strictly restricted to SalesmanPro SUPER_ADMIN.
 */

import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { resolveDateRange, DatePeriod } from "@/lib/payments/reportingService";
import { PaymentStatus, PaymentMethodType, OrderChannel } from "@prisma/client";
import { roundCurrency } from "@/lib/payments/attribution";

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
        "Forbidden: Super Admin access required",
        403
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const companyId = searchParams.get("companyId");
    const provider = searchParams.get("provider");
    const channel = searchParams.get("channel");
    const status = searchParams.get("status");
    const period = (searchParams.get("period") as DatePeriod) || "30days";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const pageSize = parseInt(searchParams.get("pageSize") || "25", 10) || 25;

    const dateRange = resolveDateRange({ period, startDate, endDate });
    const where: any = {};

    if (dateRange.gte || dateRange.lte) {
      where.createdAt = {
        ...(dateRange.gte ? { gte: dateRange.gte } : {}),
        ...(dateRange.lte ? { lte: dateRange.lte } : {}),
      };
    }

    if (companyId && companyId !== "ALL") {
      where.companyId = companyId;
    }

    if (status && status !== "ALL") {
      where.status = status.toUpperCase() as PaymentStatus;
    }

    if (provider && provider !== "ALL") {
      where.provider = provider.toUpperCase() as PaymentMethodType;
    }

    if (channel && channel !== "ALL") {
      where.channel = channel.toUpperCase() as OrderChannel;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { transactionId: { contains: q, mode: "insensitive" } },
        { providerTransactionId: { contains: q, mode: "insensitive" } },
        { internalReference: { contains: q, mode: "insensitive" } },
        { order: { trackingNumber: { contains: q, mode: "insensitive" } } },
        { order: { name: { contains: q, mode: "insensitive" } } },
        { order: { email: { contains: q, mode: "insensitive" } } },
        { company: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    // Parallel fetch of total count, records, and active company list for filters
    const [totalCount, records, companies] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          order: {
            select: {
              id: true,
              trackingNumber: true,
              name: true,
              email: true,
              phone: true,
              channel: true,
              totalFinalPrice: true,
              deliveryStatus: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.company.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
        take: 100,
      }),
    ]);

    const transactions = records.map((p) => {
      const gross = roundCurrency(Number(p.grossAmount || p.amount || 0));
      const fee = roundCurrency(Number(p.feeAmount || 0));
      const refund = roundCurrency(Number(p.refundAmount || 0));
      const net = roundCurrency(Number(p.netAmount || gross - fee - refund));

      return {
        id: p.id,
        transactionId: p.transactionId,
        providerTransactionId: p.providerTransactionId,
        internalReference: p.internalReference,
        orderId: p.orderId,
        trackingNumber: p.order?.trackingNumber || p.internalReference || p.orderId.slice(0, 8),
        customerName: p.order?.name || p.user?.name || "Customer",
        customerEmail: p.order?.email || p.user?.email,
        companyId: p.companyId,
        companyName: p.company?.name || "Platform Direct",
        companySlug: p.company?.slug,
        channel: p.channel || p.order?.channel || "WEBSITE",
        provider: p.provider || "OTHER",
        grossAmount: gross,
        feeAmount: fee,
        netAmount: net,
        refundAmount: refund,
        currency: p.currency || "KES",
        status: p.status,
        settlementStatus: p.settlementStatus || "UNSETTLED",
        paidAt: p.paidAt ? p.paidAt.toISOString() : null,
        createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
      };
    });

    return formatResponse(
      true,
      {
        transactions,
        companies,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize) || 1,
        },
      },
      "Global transactions retrieved successfully"
    );
  } catch (error: any) {
    console.error("[SUPER_ADMIN_TRANSACTIONS_ERROR]", error);
    return formatResponse(
      false,
      null,
      error.message || "Failed to retrieve transactions",
      500
    );
  }
}
