import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return formatResponse(false, null, "User ID is required", 400);
    }

    // Normalize today's date to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.staffAttendanceRecord.findUnique({
      where: {
        userId_date: {
          userId: userId,
          date: today,
        },
      },
      select: {
        checkInTime: true,
        checkOutTime: true,
        status: true,
      }
    });

    // Determine logical state
    let attendanceStatus = "NOT_STARTED"; // User hasn't clocked in
    if (record?.checkInTime && !record?.checkOutTime) {
      attendanceStatus = "CLOCKED_IN"; // Currently working
    } else if (record?.checkInTime && record?.checkOutTime) {
      attendanceStatus = "CLOCKED_OUT"; // Shift finished
    }

    return formatResponse(true, { 
      record, 
      attendanceStatus 
    }, "Status retrieved", 200);

  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
}