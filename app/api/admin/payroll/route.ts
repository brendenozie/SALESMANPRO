import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  try {
    // 1. Get all staff for this company
    
    const cacheKey = `admin:payroll:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const staffMembers = await prisma.staffProfile.findMany({
      where: { companyId: companyId as string },
      include: { user: { select: { name: true } } }
    });

  try {
    if (staffMembers) {
      await cacheSet(cacheKey, staffMembers, 60);
    }
  } catch (e) {}

    // 2. Generate or Update records for current month
    const payrollRows = staffMembers.map(staff => {
      const tax = staff.salary * 0.15; // 15% Statutory Tax
      const net = staff.salary - tax;

      return {
        id: `PAY-${staff.id.substring(18)}-${month}`,
        staff: staff.user.name,
        base: staff.salary,
        tax: tax,
        net: net,
        status: "CALCULATED",
        bankAccount: staff.bankAccount,
        bankCode: staff.bankCode
      };
    });

    const summary = {
      totalLiability: payrollRows.reduce((acc, curr) => acc + curr.net, 0),
      totalTax: payrollRows.reduce((acc, curr) => acc + curr.tax, 0),
    };

    //cache

    // const cacheKey = `admin:payroll:${companyId || 'global'}:${month}-${year}`;
    try {
      await cacheSet(cacheKey, { data: payrollRows, summary }, 60);
    } catch (e) {}

    return NextResponse.json({ data: payrollRows, summary });
  } catch (error) {
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}