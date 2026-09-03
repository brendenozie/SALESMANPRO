import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { getDistance } from "@/lib/geo-utils.ts"; 
import { formatResponse } from "@/lib/formatResponse";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, userLat, userLng, companyId } = body;

  // 1. Validation Guard
  if (!userLat || !userLng || !userId || !companyId) {
    return formatResponse(false, null, "Missing location or identity data.", 400);
  }

  // OPTIMIZATION: Use findUnique with specific selects to minimize I/O.
  // We fetch this first to prevent unnecessary upserts if they are out of range.
  const company = await prisma.company.findUnique({ 
    where: { id: companyId },
    select: { lat: true, lng: true, radius: true }
  });

  if (!company?.lat || !company?.lng) {
    return formatResponse(false, null, "Company geofence not configured.", 400);
  }

  // 2. Geofence Calculation
  const distance = getDistance(userLat, userLng, company.lat, company.lng);

  if (distance > company.radius) {
    return formatResponse(false, { distance, radius: company.radius }, "Out of range.", 403);
  }

  // OPTIMIZATION: Date Normalization
  // Prisma's unique constraints on 'date' types usually expect the date at midnight.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const attendance = await prisma.staffAttendanceRecord.upsert({
      where: { 
        userId_date: { 
          userId, 
          date: today // Normalized date
        } 
      },
      update: { 
        // Logic: Only update checkIn if it wasn't already set, or move to a 'checkOut' logic
        checkInTime: new Date() 
      },
      create: { 
        userId, 
        companyId, 
        date: today, 
        checkInTime: new Date(),
        method: 'GEO_FENCE' 
      },
      select: { id: true, checkInTime: true, status: true }
    });

    
    try {
      await cacheDel(`tenant:${companyId}:geofence:*`);
      await cacheDel(`admin:geofence:*`);
    } catch (e) {}
    return formatResponse(true, attendance, "Clock-in successful.", 200);
  } catch (error) {
    return formatResponse(false, null, "Database sync error.", 500);
  }
}
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";

// import { getDistance } from "@/lib/geo-utils.ts"; // Helper using Haversine

// export async function POST(req: Request) {
//   const { userId, userLat, userLng, companyId } = await req.json();

//   // 1. Fetch Company Geofence settings
//   const company = await prisma.company.findUnique({ 
//     where: { id: companyId },
//     select: { lat: true, lng: true, radius: true } // radius in meters (e.g., 200m)
//   });

//   if (!company) {
//     return Response.json({ error: "Company not found." }, { status: 404 });
//   }

//   if (!company.lat || !company.lng || !company.radius) {
//     return Response.json({ error: "Geofence not configured for this company." }, { status: 400 });
//   }

//   const distance = getDistance(userLat, userLng, company?.lat, company?.lng);

//   if (distance > company.radius) {
//     return Response.json({ error: "Out of range. You must be at the office." }, { status: 403 });
//   }

//   // 2. Logic to Clock In
//   const attendance = await prisma.staffAttendanceRecord.upsert({
//     where: { userId_date: { userId, date: new Date() } },
//     update: { checkInTime: new Date() },
//     create: { 
//       userId, 
//       companyId, 
//       date: new Date(), 
//       checkInTime: new Date(),
//       method: 'GEO_FENCE' 
//     }
//   });

//   return Response.json(attendance);
// }