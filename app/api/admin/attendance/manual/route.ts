import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, companyId, time, type, date, note } = body;

    // 1. Validation Guard
    if (!userId || !date || !time || !type) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

    // 2. Precise Date/Time Construction
    // Normalizing the reference date (midnight) and the specific timestamp
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    
    const combinedDateTime = new Date(`${date}T${time}:00`);

    // 3. Dynamic Payload Assignment
    const fieldToUpdate = type === "IN" ? "checkInTime" : "checkOutTime";

    // OPTIMIZATION: Single DB hit using Upsert
    // We remove the findUnique and handle everything here.
    const attendance = await prisma.staffAttendanceRecord.upsert({
      where: {
        userId_date: {
          userId,
          date: attendanceDate,
        },
      },
      update: {
        [fieldToUpdate]: combinedDateTime,
        isManual: true,
        adminNote: note,
        method: "MANUAL_OVERRIDE",
      },
      create: {
        userId,
        companyId,
        date: attendanceDate,
        [fieldToUpdate]: combinedDateTime,
        isManual: true,
        adminNote: note,
        method: "MANUAL_OVERRIDE",
        status: "PRESENT", 
      },
      // OPTIMIZATION: Return only necessary data
      select: { id: true, checkInTime: true, checkOutTime: true, status: true }
    });

    return formatResponse(true, attendance, "Manual override successful", 200);

  } catch (error: any) {
    console.error("Manual Override Error:", error);
    return formatResponse(false, null, error.message || "Internal Server Error", 500);
  }
}
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { userId, companyId, time, type, date, note } = body;

//     // 1. Combine date and time strings into a Date object
//     // Expects date "YYYY-MM-DD" and time "HH:mm"
//     const combinedDateTime = new Date(`${date}T${time}:00`);

//     // 2. Find or Create the attendance record for that day
//     const existingRecord = await prisma.staffAttendanceRecord.findUnique({
//       where: {
//         userId_date: {
//           userId,
//           date: new Date(date), // Ensure this matches your date-only format
//         },
//       },
//     });

//     const updateData = type === "IN" 
//       ? { checkInTime: combinedDateTime } 
//       : { checkOutTime: combinedDateTime };

//     const attendance = await prisma.staffAttendanceRecord.upsert({
//       where: {
//         userId_date: {
//           userId,
//           date: new Date(date),
//         },
//       },
//       update: {
//         ...updateData,
//         isManual: true,
//         adminNote: note,
//         method: "MANUAL_OVERRIDE",
//       },
//       create: {
//         userId,
//         companyId,
//         date: new Date(date),
//         ...updateData,
//         isManual: true,
//         adminNote: note,
//         method: "MANUAL_OVERRIDE",
//         status: "PRESENT", // You can add logic to check if 'LATE' based on company policy
//       },
//     });

//     return NextResponse.json({ success: true, data: attendance });
//   } catch (error: any) {
//     console.error("Manual Override Error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const { companyId, userId, time, type, date, note } = await request.json();

//     if (!userId || !time || !type) {
//       return NextResponse.json({ error: "Missing required data" }, { status: 400 });
//     }

//     // Upsert logic: Find existing record for this user/day or create new one
//     const record = await prisma.staffAttendanceRecord.upsert({
//       where: {
//         userId_date: {
//           userId: userId,
//           date: new Date(date),
//         }
//       },
//       update: {
//         [type === 'IN' ? 'checkInTime' : 'checkOutTime']: time,
//         method: 'MANUAL_ADMIN',
//         notes: note
//       },
//       create: {
//         companyId,
//         userId,
//         date: new Date(date),
//         [type === 'IN' ? 'checkInTime' : 'checkOutTime']: time,
//         method: 'MANUAL_ADMIN',
//         status: 'PRESENT',
//         notes: note
//       }
//     });

//     return NextResponse.json({ success: true, record });
//   } catch (error) {
//     console.error("MANUAL_CLOCK_ERROR", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }