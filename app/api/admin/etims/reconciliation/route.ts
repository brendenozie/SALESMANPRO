import { NextResponse } from "next/server";
import { etimsService } from "@/lib/etims/service";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET /api/admin/etims/reconciliation?companyId=...&startDate=...&endDate=...
 * Reconciles store paid orders vs eTIMS fiscal invoices.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!companyId) {
      return formatResponse(false, null, "Company ID is required.", 400);
    }

    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default past 30 days
    const endDate = endDateParam ? new Date(endDateParam) : new Date();

    const summary = await etimsService.reconcileCompanySales(companyId, startDate, endDate);

    return formatResponse(true, summary, "Reconciliation completed successfully.", 200);
  } catch (error: any) {
    console.error("[ETIMS_RECON_ERROR]", error);
    return formatResponse(false, null, error?.message || "Reconciliation error", 500);
  }
}
