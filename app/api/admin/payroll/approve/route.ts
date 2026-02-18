import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(request: Request) {
  try {
    const { companyId, isLocked } = await request.json();

    // Update company settings or a dedicated PayrollPeriod record
    // Here we simulate the locking of the Jan 2026 period
    const approval = await prisma.company.update({
      where: { id: companyId },
      data: { payrollLocked: isLocked } 
    });

    return NextResponse.json({ 
      success: true, 
      locked: isLocked,
      message: isLocked ? "Payroll locked for disbursement." : "Payroll unlocked for editing."
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update approval status" }, { status: 500 });
  }
}