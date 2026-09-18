import { NextResponse } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import {
  getIncomeStatement,
  getCashFlowStatement,
  getAccountsReceivable,
  getAccountsPayable,
  getInventoryValuation,
  getTaxReport,
  getAttentionItems,
} from "@/lib/finance/financeService";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let targetCompanyId = companyId;
    if (!targetCompanyId && slug) {
      const comp = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (comp) targetCompanyId = comp.id;
    }

    if (!targetCompanyId) {
      return formatResponse(false, null, "companyId or slug is required", 400);
    }

    const filter = { startDate, endDate };

    // Parallelize calculations for high speed
    const [
      pnl,
      cashFlow,
      ar,
      ap,
      inventory,
      tax,
      attentionItems,
    ] = await Promise.all([
      getIncomeStatement(targetCompanyId, filter),
      getCashFlowStatement(targetCompanyId, filter),
      getAccountsReceivable(targetCompanyId),
      getAccountsPayable(targetCompanyId),
      getInventoryValuation(targetCompanyId),
      getTaxReport(targetCompanyId, filter),
      getAttentionItems(targetCompanyId),
    ]);

    return formatResponse(
      true,
      {
        pnl,
        cashFlow,
        receivables: ar,
        payables: ap,
        inventory,
        tax,
        attentionItems,
      },
      "Financial overview loaded successfully",
      200
    );
  } catch (error: any) {
    console.error("Finance overview error:", error);
    return formatResponse(false, null, error?.message || "Failed to load financial overview", 500);
  }
}
