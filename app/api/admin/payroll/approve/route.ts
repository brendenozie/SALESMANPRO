import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function POST(request: Request) {
  try {
    const { companyId, isLocked } = await request.json();

    // Update company settings or a dedicated PayrollPeriod record
    // Here we simulate the locking of the Jan 2026 period
    const approval = await prisma.company.update({
      where: { id: companyId },
      data: { payrollLocked: isLocked } 
    });

    return formatResponse(
      true,
      { 
        success: true, 
        locked: isLocked,
        message: isLocked ? "Payroll locked for disbursement." : "Payroll unlocked for editing."
      },
        `Payroll period for Jan 2026 has been ${isLocked ? 'locked' : 'unlocked'}.`,
        200
      );
  } catch (error) {
    return formatResponse(false, null, "Failed to update approval status", 500);
  }
}