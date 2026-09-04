/**
 * app/api/admin/payments/export/route.ts
 *
 * Secure CSV Export API for Payments.
 * Strictly respects tenant permissions and active filters.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { canAccessCompanyAdmin } from "@/lib/auth/authorization";
import prisma from "@/server/db/prismadb";
import {
  getStorePaymentTransactions,
  DatePeriod,
} from "@/lib/payments/reportingService";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return new NextResponse("Missing companyId", { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, userId: true, name: true },
    });

    if (!company) {
      return new NextResponse("Store not found", { status: 404 });
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
      return new NextResponse("Forbidden: Access denied to store export", { status: 403 });
    }

    const period = (searchParams.get("period") as DatePeriod) || "all";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const status = searchParams.get("status") || undefined;
    const channel = searchParams.get("channel") || undefined;
    const provider = searchParams.get("provider") || undefined;
    const search = searchParams.get("search") || undefined;

    // Fetch up to 10,000 transactions for export
    const { transactions } = await getStorePaymentTransactions({
      companyId: company.id,
      period,
      startDate,
      endDate,
      status,
      channel,
      provider,
      search,
      page: 1,
      pageSize: 10000,
    });

    // Generate CSV
    const headers = [
      "Date",
      "Transaction ID",
      "Order Tracking #",
      "Customer",
      "Channel",
      "Provider",
      "Gross Amount",
      "Fees",
      "Refunds",
      "Net Amount",
      "Currency",
      "Status",
      "Settlement",
    ];

    const escapeCsv = (val: any) => {
      const s = String(val ?? "").replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = transactions.map((t) => [
      escapeCsv(t.date),
      escapeCsv(t.transactionId),
      escapeCsv(t.trackingNumber),
      escapeCsv(t.customerName),
      escapeCsv(t.channel),
      escapeCsv(t.provider),
      t.grossAmount.toFixed(2),
      t.feeAmount.toFixed(2),
      t.refundAmount.toFixed(2),
      t.netAmount.toFixed(2),
      escapeCsv(t.currency),
      escapeCsv(t.status),
      escapeCsv(t.settlementStatus),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const fileName = `payments-${company.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[PAYMENTS_EXPORT_ERROR]", err);
    return new NextResponse("Export generation failed", { status: 500 });
  }
}
