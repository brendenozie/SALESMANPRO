import { formatResponse } from "@/lib/formatResponse";
import { getCashFlowStatement } from "@/lib/finance/financeService";
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

    const cashFlow = await getCashFlowStatement(targetCompanyId, { startDate, endDate });

    return formatResponse(true, cashFlow, "Cash Flow statement generated successfully", 200);
  } catch (error: any) {
    console.error("Cash flow error:", error);
    return formatResponse(false, null, error?.message || "Failed to generate Cash Flow statement", 500);
  }
}
