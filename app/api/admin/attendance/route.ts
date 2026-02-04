import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logs = await prisma.staffAttendanceRecord.findMany({
    where: {
      companyId: companyId as string,
      date: today,
    },
    include: {
      user: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate Stats for KPIs
  const stats = {
    total: await prisma.user.count({ where: { companyId: companyId as string } }),
    present: logs.filter(l => l.checkInTime).length,
    late: logs.filter(l => l.status === "LATE").length,
    absent: 0, // Logic: total - present
  };
  stats.absent = stats.total - stats.present;

  return NextResponse.json({ logs, stats });
}