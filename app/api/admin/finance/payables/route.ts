import { formatResponse } from "@/lib/formatResponse";
import { getAccountsPayable } from "@/lib/finance/financeService";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");

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

    const ap = await getAccountsPayable(targetCompanyId);

    return formatResponse(true, ap, "Accounts Payable data fetched successfully", 200);
  } catch (error: any) {
    console.error("Payables fetch error:", error);
    return formatResponse(false, null, error?.message || "Failed to fetch Accounts Payable", 500);
  }
}
