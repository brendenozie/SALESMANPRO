import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(request: Request) {
  try {
    const { companyId, userId, type, startDate, endDate, backupId, reason } = await request.json();

    // Calculate days between dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysRequested = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const overlappingFreeze = await prisma.leaveFreeze.findFirst({
      where: {
        companyId,
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } }
        ]
      }
    });

    if (overlappingFreeze) {
      return NextResponse.json({ 
        error: `Selected dates conflict with the '${overlappingFreeze.label}' freeze period.` 
      }, { status: 400 });
    }

    const newRequest = await prisma.leaveRequest.create({
      data: {
        companyId,
        userId,
        type,
        startDate: start,
        endDate: end,
        daysRequested,
        backupStaffId: backupId || null,
        reason,
        status: 'PENDING', // Admins can auto-approve if needed
      },
    });

    
    try {
      await cacheDel(`tenant:${companyId}:create:*`);
      await cacheDel(`admin:create:*`);
    } catch (e) {}
    return NextResponse.json({ success: true, data: newRequest });
  } catch (error) {
    return NextResponse.json({ error: "Failed to post request" }, { status: 500 });
  }
}