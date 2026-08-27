import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const blockId = searchParams.get("blockId");
  const roomId = searchParams.get("roomId");
  const companyId = searchParams.get("companyId");

  // FIX: Build nested objects carefully so they don't overwrite each other
  const whereClause: any = {
    status: "ACTIVE",
    room: {},
    hostelMember: {},
  };

  if (blockId) whereClause.room.blockId = blockId;
  if (roomId) whereClause.room.id = roomId;
  if (companyId) whereClause.hostelMember.companyId = companyId;

  // Clean up empty objects to avoid Prisma query errors
  if (Object.keys(whereClause.room).length === 0) delete whereClause.room;
  if (Object.keys(whereClause.hostelMember).length === 0)
    delete whereClause.hostelMember;

  try {
    const cacheKey = `admin:residents:${companyId || "global"}:all`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    const residents = await prisma.hostelAllocation.findMany({
      where: whereClause,
      include: {
        hostelMember: {
          include: {
            student: {
              include: { user: { select: { name: true } } },
            },
            educator: {
              include: { user: { select: { name: true } } },
            },
            consumer: {
              include: { user: { select: { name: true, email: true, phone: true } } },
            },
          },
        },
        room: true,
      },
    });

    try {
      if (residents) {
        await cacheSet(cacheKey, residents, 60);
      }
    } catch (e) {
      console.error("Error caching residents data:", e);
    }

    const data = residents
      .map((res) => {
        // Safety check: ensure hostelMember exists before processing
        const member = res.hostelMember;
        if (!member) return null;

        return {
          id: member.id,
          // Safe slice with fallback
          displayId: member.memberId || member.id.slice(-7).toUpperCase(),
          name: member.student ? `${member.student.firstName} ${member.student.lastName}` : member.educator?.user?.name || member.consumer?.user?.name || "N/A",
          room: res.room.roomNumber,
          phone: member.student?.phone || member.educator?.phone || member.consumer?.user.phone || "No Contact",
          status: "In-House",
        };
      })
      .filter(Boolean); // Remove any null entries

    try {
      if (data) {
        await cacheSet(cacheKey, data, 60); // Cache for 60 seconds
      }
    } catch (e) {
      console.error("Error caching formatted residents data:", e);
    }

    return formatResponse(true, data, "Residents fetched successfully", 200);
  } catch (error) {
    console.error("[RESIDENTS_GET_ERROR]", error);
    return formatResponse(false, null, "Failed to fetch residents", 500);
  }
}

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const blockId = searchParams.get("blockId");
//   const roomId = searchParams.get("roomId");
//   const companyId = searchParams.get("companyId");

//   const whereClause: any = {
//     status: "ACTIVE" // Only show current residents
//   };

//   if (blockId) {
//     whereClause.room = {
//       blockId: blockId
//     };
//   }
//   if (roomId) {
//     whereClause.room = {
//       id: roomId
//     };
//   }
//   if (companyId) {
//     whereClause.hostelMember = {
//       companyId: companyId
//     };
//   }

//   try {
//     const residents = await prisma.hostelAllocation.findMany({
//       where: whereClause,
//       include: {
//         hostelMember: {
//           select: {
//             id: true,
//             studentId: true,
//             student: {
//               select: {
//                 id: true,
//                 firstName: true,
//                 lastName: true,
//                 admissionNumber: true,
//                 phone: true,
//               },
//             include: {
//                 user: { select: { name: true } }
//               }
//             },
//             educatorId: true,
//             educator: {
//               select: {
//                 id: true,
//                 userId: true,
//                 phone: true,
//               },
//               include: { user: { select: { name: true } } }
//             },
//           }
//         },
//         room: true, // Room details
//       }
//     });

//     const data = residents.map((res) => ({
//       id: res.hostelMember?.id,
//       studentId: res.hostelMember?.id.slice(-7).toUpperCase(), // Display friendly ID
//       name: res.hostelMember?.student
//         ? `${res.hostelMember.student.firstName} ${res.hostelMember.student.lastName}`
//         : res.hostelMember?.educator?.user?.name || "N/A",
//       room: res.room.roomNumber,
//       grade: "N/A", //res.hostelMember.grade ||
//       bloodGroup: "Unknown", //res.hostelMember.bloodGroup ||
//       parent: "Not Listed", //res.hostelMember.parentName ||
//       phone: res.hostelMember?.student?.phone || res.hostelMember?.educator?.phone || "No Contact",
//       status: "In-House" // You can add logic for 'On-Leave' if you have a leave model
//     }));

//     return NextResponse.json({ data });
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to fetch residents" }, { status: 500 });
//   }
// }

// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      roomId,
      studentId,
      educatorId,
      consumerId,
      companyId,
      memberId, // e.g., "HSTL-2024-001"
    } = body;

    if (!roomId || !companyId || (!studentId && !educatorId && !consumerId)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Use a transaction to ensure both member creation and allocation succeed together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if room is at capacity
      const room = await tx.hostelRoom.findUnique({
        where: { id: roomId },
        include: { allocations: { where: { status: "ACTIVE" } } },
      });

      if (!room || room.allocations.length >= room.capacity) {
        throw new Error("Room is already at full capacity");
      }

      // 2. Find or Create the HostelMember bridge
      // This ensures we don't create duplicate members for the same student/educator
      const member = await tx.hostelMember.upsert({
        where: studentId ? { studentId } : educatorId ? { educatorId } : { consumerId },
        update: { status: "ACTIVE" }, // Re-activate if they were previously inactive
        create: {
          companyId,
          memberId, // The unique barcode/ID
          studentId: studentId || null,
          educatorId: educatorId || null,
          consumerId: consumerId || null,
        },
      });

      // 3. Check if member already has an active allocation
      const existingAllocation = await tx.hostelAllocation.findFirst({
        where: {
          hostelMemberId: member.id,
          status: "ACTIVE",
        },
      });

      if (existingAllocation) {
        throw new Error("Member is already allocated to a room");
      }

      // 4. Create the Allocation
      const allocation = await tx.hostelAllocation.create({
        data: {
          roomId,
          hostelMemberId: member.id,
          status: "ACTIVE",
          startDate: new Date(),
        },
      });

      return { member, allocation };
    });

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error("[ALLOCATION_POST]", error);
    return NextResponse.json(
      { error: error.message || "Failed to process allocation" },
      { status: 500 },
    );
  }
}
