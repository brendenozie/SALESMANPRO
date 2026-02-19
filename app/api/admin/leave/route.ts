import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const status = searchParams.get("status");

  if (!companyId) return formatResponse(false, null, "Company ID is required", 400);

  try {
    
    const cacheKey = `admin:leave:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const requests = await prisma.leaveRequest.findMany({
      where: {
        companyId,
        ...(status && status !== 'All' && { status: status.toUpperCase() as any })
      },
      include: {
        user: { select: { name: true } },
        backupStaff: { select: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

  try {
    if (requests) {
      await cacheSet(cacheKey, requests, 60);
    }
  } catch (e) {}

    return formatResponse(true, { data: requests }, "Leave requests fetched", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch leave", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const { requestId, status, adminNote } = await request.json();

    const updated = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status, adminNote }
    });

    // logic: If approved, deduct from staff's leave balance
    if (status === 'APPROVED') {
       // await updateLeaveBalance(updated.userId, updated.daysRequested);
    }

    
    try { await cacheDel(`admin:leave:${updated.companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updated, "Leave request updated", 200);
  } catch (error) {
    return formatResponse(false, null, "Update failed", 500);
  }
}