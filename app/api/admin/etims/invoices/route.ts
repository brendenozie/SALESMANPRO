import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET /api/admin/etims/invoices
 * Lists eTIMS invoices for a company with filters and pagination.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const status = searchParams.get("status");
    const invoiceType = searchParams.get("type"); // ORIGINAL | CREDIT_NOTE
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    if (!companyId) {
      return formatResponse(false, null, "Company ID is required.", 400);
    }

    const where: any = { companyId };

    if (status && status !== "ALL") {
      where.submissionStatus = status;
    }

    if (invoiceType && invoiceType !== "ALL") {
      where.invoiceType = invoiceType;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { orderTrackingNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPin: { contains: search, mode: "insensitive" } },
        { controlCode: { contains: search, mode: "insensitive" } },
      ];
    }

    const [invoices, total] = await prisma.$transaction([
      prisma.eTIMSInvoice.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.eTIMSInvoice.count({ where }),
    ]);

    // Aggregate statistics
    const stats = await prisma.eTIMSInvoice.groupBy({
      by: ["submissionStatus"],
      where: { companyId },
      _count: { _all: true },
      _sum: { totalAmount: true },
    });

    const summary = {
      totalInvoices: total,
      confirmed: 0,
      confirmedAmount: 0,
      pending: 0,
      failed: 0,
    };

    stats.forEach((s) => {
      if (s.submissionStatus === "CONFIRMED") {
        summary.confirmed = s._count._all;
        summary.confirmedAmount = s._sum.totalAmount || 0;
      } else if (s.submissionStatus === "PENDING" || s.submissionStatus === "QUEUED") {
        summary.pending += s._count._all;
      } else if (s.submissionStatus === "FAILED") {
        summary.failed += s._count._all;
      }
    });

    return formatResponse(
      true,
      {
        invoices,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        summary,
      },
      "Invoices retrieved successfully",
      200
    );
  } catch (error: any) {
    console.error("[ETIMS_INVOICES_GET_ERROR]", error);
    return formatResponse(false, null, error?.message || "Failed to fetch eTIMS invoices", 500);
  }
}
