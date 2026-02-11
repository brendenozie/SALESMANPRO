import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-device-key");
    if (!apiKey) {
      return Response.json({ error: "Missing Device API Key" }, { status: 401 });
    }

    const body = await req.json();
    const { staffHardwareId, timestamp } = body;

    if (!staffHardwareId || !timestamp) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    const punchTime = new Date(timestamp);
    if (isNaN(punchTime.getTime())) {
      return Response.json({ error: "Invalid timestamp" }, { status: 400 });
    }

    // Normalize date once
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Validate device
      const device = await tx.device.findUnique({
        where: { apiKey },
        select: { id: true, companyId: true }
      });

      if (!device) throw new Error("UNAUTHORIZED_DEVICE");

      // 2️⃣ Find user
      const user = await tx.user.findFirst({
        where: {
          hardwareId: staffHardwareId,
          companyId: device.companyId
        },
        select: { id: true }
      });

      if (!user) throw new Error("USER_NOT_FOUND");

      // 3️⃣ Find today's attendance
      const existing = await tx.staffAttendanceRecord.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: today
          }
        }
      });

      // 4️⃣ Decide IN / OUT
      if (!existing) {
        await tx.staffAttendanceRecord.create({
          data: {
            userId: user.id,
            companyId: device.companyId,
            date: today,
            checkInTime: punchTime,
            method: "BIOMETRIC"
          }
        });

        return { action: "CHECK_IN" };
      }

      if (existing.checkInTime && !existing.checkOutTime) {
        await tx.staffAttendanceRecord.update({
          where: { id: existing.id },
          data: { checkOutTime: punchTime }
        });

        return { action: "CHECK_OUT" };
      }

      return { action: "IGNORED" };
    });

    return Response.json({ success: true, ...result });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED_DEVICE") {
      return Response.json({ error: "Unauthorized Device" }, { status: 401 });
    }

    if (err.message === "USER_NOT_FOUND") {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    console.error("Attendance Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
// import prisma from "@/server/db/prismadb";

// export async function POST(req: Request) {
//   const apiKey = req.headers.get("x-device-key");
//   const { staffHardwareId, timestamp } = await req.json();

//   if (!apiKey) {
//     return Response.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   // OPTIMIZATION 1: Collapse Authentication and User Mapping into one query
//   // We fetch the user only if they belong to the company associated with the API Key
//   const user = await prisma.user.findFirst({
//     where: { 
//       hardwareId: staffHardwareId,
//       company: { devices: { some: { apiKey } } } 
//     },
//     select: { id: true, companyId: true }
//   });

//   if (!user) return Response.json({ error: "Invalid credentials" }, { status: 401 });

//   const recordTime = new Date(timestamp);
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   // OPTIMIZATION 2: Single Transaction logic using the 'upsert' or 'conditional update'
//   // We use findUnique first but with minimal selection to keep it fast
//   try {
//     const existing = await prisma.staffAttendanceRecord.findUnique({
//       where: { userId_date: { userId: user.id, date: today } },
//       select: { id: true, checkOutTime: true }
//     });

//     if (!existing) {
//       // First hit of the day: Clock In
//       await prisma.staffAttendanceRecord.create({
//         data: {
//           userId: user.id,
//           companyId: user.companyId,
//           date: today,
//           checkInTime: recordTime,
//           method: 'BIOMETRIC'
//         }
//       });
//       return Response.json({ success: true, action: "IN" });
//     } 
    
//     if (!existing.checkOutTime) {
//       // Second hit: Clock Out
//       await prisma.staffAttendanceRecord.update({
//         where: { id: existing.id },
//         data: { checkOutTime: recordTime }
//       });
//       return Response.json({ success: true, action: "OUT" });
//     }

//     return Response.json({ message: "Already clocked out for today" }, { status: 400 });

//   } catch (error) {
//     // Catch potential race conditions if two requests hit at the exact same millisecond
//     return Response.json({ error: "Processing error" }, { status: 409 });
//   }
// }
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";


// export async function POST(req: Request) {
//   // Authentication check: Ensure the request comes from the registered Device ID
//   const apiKey = req.headers.get("x-device-key");
//   const { staffHardwareId, timestamp, deviceId } = await req.json();

//   if (!apiKey) {
//     return Response.json({ error: "Missing Device API Key" }, { status: 401 });
//   }

//   const device = await prisma.device.findUnique({ where: { apiKey } });
//   if (!device) return Response.json({ error: "Unauthorized Device" }, { status: 401 });

//   // 1. Map Hardware ID to System User ID
//   const user = await prisma.user.findFirst({ 
//     where: { hardwareId: staffHardwareId, companyId: device.companyId } 
//   });

//   if (!user) return Response.json({ error: "User not found" }, { status: 404 });

//   // 2. Automatic In/Out Detection
//   // If user has no Clock-In today, this is an 'IN'. If they have an 'IN' but no 'OUT', this is an 'OUT'.
//   const today = new Date();
//   today.setHours(0,0,0,0);

//   const existing = await prisma.staffAttendanceRecord.findUnique({
//     where: { userId_date: { userId: user.id, date: today } }
//   });

//   if (!existing) {
//     // Create new Clock-In
//     await prisma.staffAttendanceRecord.create({
//       data: { 
//         userId: user.id, 
//         companyId: device.companyId, 
//         date: today, 
//         checkInTime: new Date(timestamp),
//         method: 'BIOMETRIC' 
//       }
//     });
//   } else if (existing.checkInTime && !existing.checkOutTime) {
//     // Update existing with Clock-Out
//     await prisma.staffAttendanceRecord.update({
//       where: { id: existing.id },
//       data: { checkOutTime: new Date(timestamp) }
//     });
//   }

//   return Response.json({ success: true });
// }