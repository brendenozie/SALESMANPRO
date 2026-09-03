import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { etimsService } from "@/lib/etims/service";

/**
 * GET /api/super-admin/etims
 * Platform-wide eTIMS integration health, store metrics, and failed queues.
 */
export async function GET(req: Request) {
  try {
    const totalStores = await prisma.company.count();

    // Group store configurations by status
    const configStats = await prisma.kraConfiguration.groupBy({
      by: ["status", "integrationMode", "invoicingRequirement"],
      _count: { _all: true },
    });

    let configuredStores = 0;
    let activeStores = 0;
    let pendingStores = 0;
    let errorStores = 0;
    let oscuCount = 0;
    let vscuCount = 0;

    configStats.forEach((s) => {
      configuredStores += s._count._all;
      if (s.status === "ACTIVE") activeStores += s._count._all;
      else if (s.status === "PENDING_SETUP") pendingStores += s._count._all;
      else if (s.status === "ERROR") errorStores += s._count._all;

      if (s.integrationMode === "VSCU") vscuCount += s._count._all;
      else oscuCount += s._count._all;
    });

    // Invoice volume in last 24h and 30d
    const now = new Date();
    const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const past30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [invoices24h, invoices30d, failedQueue] = await prisma.$transaction([
      prisma.eTIMSInvoice.count({
        where: { createdAt: { gte: past24h }, submissionStatus: "CONFIRMED" },
      }),
      prisma.eTIMSInvoice.count({
        where: { createdAt: { gte: past30d }, submissionStatus: "CONFIRMED" },
      }),
      prisma.eTIMSInvoice.findMany({
        where: { submissionStatus: "FAILED" },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          companyId: true,
          company: { select: { name: true, slug: true } },
          invoiceNumber: true,
          orderTrackingNumber: true,
          totalAmount: true,
          errorCode: true,
          errorMessage: true,
          retryCount: true,
          createdAt: true,
        },
      }),
    ]);

    // Pending sync events
    const pendingEvents = await prisma.eTIMSSyncEvent.count({
      where: { status: "PENDING" },
    });

    return formatResponse(
      true,
      {
        metrics: {
          totalStores,
          configuredStores,
          activeStores,
          pendingStores,
          errorStores,
          oscuCount,
          vscuCount,
          invoicesConfirmed24h: invoices24h,
          invoicesConfirmed30d: invoices30d,
          failedQueueCount: failedQueue.length,
          pendingSyncEvents: pendingEvents,
        },
        failedQueue,
        systemStatus: errorStores === 0 ? "HEALTHY" : "DEGRADED",
      },
      "Super Admin eTIMS metrics retrieved",
      200
    );
  } catch (error: any) {
    console.error("[SUPER_ADMIN_ETIMS_ERROR]", error);
    return formatResponse(false, null, error?.message || "Super Admin error", 500);
  }
}

/**
 * POST /api/super-admin/etims
 * Trigger bulk retry of failed queue.
 */
export async function POST(req: Request) {
  try {
    const failedInvoices = await prisma.eTIMSInvoice.findMany({
      where: { submissionStatus: "FAILED" },
      take: 25,
      select: { id: true },
    });

    let successCount = 0;
    let failCount = 0;

    for (const inv of failedInvoices) {
      try {
        const result = await etimsService.retryInvoiceSubmission(inv.id);
        if (result.success) successCount++;
        else failCount++;
      } catch (e) {
        failCount++;
      }
    }

    return formatResponse(
      true,
      {
        processed: failedInvoices.length,
        succeeded: successCount,
        failed: failCount,
      },
      `Bulk retry processed ${failedInvoices.length} invoices: ${successCount} confirmed, ${failCount} failed.`,
      200
    );
  } catch (error: any) {
    return formatResponse(false, null, error?.message || "Failed bulk retry.", 500);
  }
}
