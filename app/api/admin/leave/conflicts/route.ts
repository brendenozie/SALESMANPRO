import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { eachDayOfInterval, format } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  try {
    // 1. Get total headcount per department
    const departments = await prisma.staffProfile.groupBy({
      by: ['department'],
      where: { companyId },
      _count: { id: true }
    });

    // 2. Get all active/pending leave
    
    const cacheKey = `admin:conflicts:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const leave = await prisma.leaveRequest.findMany({
      where: { companyId, status: { in: ['APPROVED', 'PENDING'] } },
      include: { user: { include: { staffProfile: true } } }
    });

  try {
    if (leave) {
      await cacheSet(cacheKey, leave, 60);
    }
  } catch (e) {}

    const conflicts: Record<string, string[]> = {}; // Date -> Dept[]

    // 3. Logic: Check each day for 15% threshold
    leave.forEach(req => {
      const days = eachDayOfInterval({ start: req.startDate, end: req.endDate });
      const dept = req.user.staffProfile.department;
      const deptTotal = departments.find(d => d.department === dept)?._count.id || 1;

      days.forEach(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dailyDeptAbsence = leave.filter(l => 
          l.user.staffProfile.department === dept &&
          day >= l.startDate && day <= l.endDate
        ).length;

        if ((dailyDeptAbsence / deptTotal) > 0.15) {
          if (!conflicts[dateKey]) conflicts[dateKey] = [];
          if (!conflicts[dateKey].includes(dept)) conflicts[dateKey].push(dept);
        }
      });
    });

    return NextResponse.json({ conflicts });
  } catch (error) {
    return NextResponse.json({ error: "Conflict analysis failed" }, { status: 500 });
  }
}