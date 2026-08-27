import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { calculateDistance } from "@/lib/geofencing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, companyId, type, imageUrl, coords } = body;

    // 1. Validation
    if (!userId || !companyId || !type) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

    const now = new Date();
    
    // 2. Normalize date to midnight for the unique constraint [userId_date]
    // This ensures we only have one record per staff member per day.
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // 3. Determine if we are updating Check-In or Check-Out
    const isCheckIn = type === "IN";
    const fieldToUpdate = isCheckIn ? "checkInTime" : "checkOutTime";

    // 4. Database Transaction
    // We use a transaction to ensure both the record and the audit log are saved
    const result = await prisma.$transaction(async (tx) => {
      // Example: Basic Geofence Check
      // const OFFICE_COORDS = { lat: 1.234, lng: 5.678 };
      // const distance = calculateDistance(coords.lat, coords.lng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);

      // if (distance > 200) { // 200 meters
      //   return formatResponse(false, null, "You are too far from the office to clock in.", 403);
      // }

      // Update or Create the daily record
      const attendance = await tx.staffAttendanceRecord.upsert({
        where: {
          userId_date: {
            userId,
            date: startOfDay,
          },
        },
        update: {
          [fieldToUpdate]: now,
          imageUrl, // Capture image URL from the biometric scan
          lat: coords?.lat,
          lng: coords?.lng,
          method: "BIOMETRIC", // Or WEB_PORTAL depending on your preference
          status: "PRESENT",
        },
        create: {
          userId,
          companyId,
          date: startOfDay,
          [fieldToUpdate]: now,
          imageUrl,
          lat: coords?.lat,
          lng: coords?.lng,
          method: "BIOMETRIC",
          status: "PRESENT",
        },
      });

      // Create an Audit Log entry for every single click
      await tx.staffAttendanceAuditLog.create({
        data: {
          userId,
          companyId,
          type,
          timestamp: now,
          method: "BIOMETRIC",
          note: `Staff self-${type.toLowerCase()}`,
        },
      });

      return attendance;
    });

    return formatResponse(true, result, `Clock-${type} successful`, 200);

  } catch (error: any) {
    console.error("Attendance Error:", error);
    return formatResponse(false, null, error.message || "Internal Server Error", 500);
  }
}