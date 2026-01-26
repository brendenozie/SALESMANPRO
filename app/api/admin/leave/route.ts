import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const status = searchParams.get("status");

  try {
    const requests = await prisma.leaveRequest.findMany({
      where: {
        companyId,
        ...(status !== 'All' && { status: status.toUpperCase() })
      },
      include: {
        user: { select: { name: true } },
        backupStaff: { select: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: requests });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leave" }, { status: 500 });
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

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}