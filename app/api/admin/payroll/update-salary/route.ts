import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/server/db/prismadb";
import { authOptions } from "@/lib/auth"; // adjust path if needed

export async function POST(req: Request) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = session.user.id;
    const { staffId, salary, reason } = await req.json();

    // 2. Validation
    const newSalary = Number(salary);
    if (!staffId || isNaN(newSalary) || newSalary < 0) {
      return NextResponse.json(
        { error: "Invalid staffId or salary" },
        { status: 400 }
      );
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // 3. Transaction (atomic & auditable)
    const result = await prisma.$transaction(async (tx) => {
      // Get existing salary
      const staff = await tx.staffProfile.findUnique({
        where: { id: staffId },
        select: { salary: true },
      });

      if (!staff) {
        throw new Error("Staff not found");
      }

      // Create audit log
      await tx.salaryHistory.create({
        data: {
          staffProfileId: staffId,
          previousSalary: staff.salary ?? 0,
          newSalary,
          changeReason: reason || "Administrative Adjustment",
          changedBy: adminId,
        },
      });

      // Update master salary
      const updatedProfile = await tx.staffProfile.update({
        where: { id: staffId },
        data: { salary: newSalary },
      });

      // Update current payroll if unlocked
      await tx.payrollRecord.updateMany({
        where: {
          staffId,
          month: currentMonth,
          year: currentYear,
          isLocked: false,
        },
        data: {
          baseSalary: newSalary,
          taxAmount: newSalary * 0.15,
          netPayable: newSalary * 0.85,
        },
      });

      return updatedProfile;
    });

      // 4. Cache Invalidation
      try {
        await cacheDel(`tenant:${staffId}:payroll:*`);
        await cacheDel(`admin:payroll:*`);
      } catch (e) {}

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Salary Update Error:", error);
    return NextResponse.json(
      { error: error.message || "Salary update failed" },
      { status: 500 }
    );
  }
}
