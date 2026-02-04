import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

import { getDistance } from "@/lib/geo-utils.ts"; // Helper using Haversine

export async function POST(req: Request) {
  const { userId, userLat, userLng, companyId } = await req.json();

  // 1. Fetch Company Geofence settings
  const company = await prisma.company.findUnique({ 
    where: { id: companyId },
    select: { lat: true, lng: true, radius: true } // radius in meters (e.g., 200m)
  });

  if (!company) {
    return Response.json({ error: "Company not found." }, { status: 404 });
  }

  if (!company.lat || !company.lng || !company.radius) {
    return Response.json({ error: "Geofence not configured for this company." }, { status: 400 });
  }

  const distance = getDistance(userLat, userLng, company?.lat, company?.lng);

  if (distance > company.radius) {
    return Response.json({ error: "Out of range. You must be at the office." }, { status: 403 });
  }

  // 2. Logic to Clock In
  const attendance = await prisma.staffAttendanceRecord.upsert({
    where: { userId_date: { userId, date: new Date() } },
    update: { checkInTime: new Date() },
    create: { 
      userId, 
      companyId, 
      date: new Date(), 
      checkInTime: new Date(),
      method: 'GEO_FENCE' 
    }
  });

  return Response.json(attendance);
}