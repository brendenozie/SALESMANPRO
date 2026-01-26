import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const today = new Date();

  try {
    // 1. Fetch all staff for this company
    const staff = await prisma.staffProfile.findMany({
      where: { companyId },
      include: { 
        user: { select: { name: true, id: true } },
        // Assuming you have an 'AttendanceLog' model or similar
        // If not, we'll simulate the logic based on 'lastClockIn'
      }
    });

    // 2. Fetch today's logs (placeholder for your specific Attendance model)
    // For now, let's assume you have a model 'AttendanceRecord'
    const records = await prisma.attendanceRecord.findMany({
      where: {
        companyId,
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        }
      },
      include: { user: true }
    });

    // 3. Calculate KPIs
    const present = records.filter(r => r.status === 'PRESENT').length;
    const late = records.filter(r => r.status === 'LATE').length;
    const absent = staff.length - records.length;

    return NextResponse.json({ 
      logs: records, 
      stats: { present, late, absent, total: staff.length } 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}