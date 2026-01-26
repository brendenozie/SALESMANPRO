import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { companyId, userId, time, type, date, note } = await request.json();

    if (!userId || !time || !type) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    // Upsert logic: Find existing record for this user/day or create new one
    const record = await prisma.attendanceRecord.upsert({
      where: {
        userId_date: {
          userId: userId,
          date: new Date(date),
        }
      },
      update: {
        [type === 'IN' ? 'checkInTime' : 'checkOutTime']: time,
        method: 'MANUAL_ADMIN',
        notes: note
      },
      create: {
        companyId,
        userId,
        date: new Date(date),
        [type === 'IN' ? 'checkInTime' : 'checkOutTime']: time,
        method: 'MANUAL_ADMIN',
        status: 'PRESENT',
        notes: note
      }
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("MANUAL_CLOCK_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}