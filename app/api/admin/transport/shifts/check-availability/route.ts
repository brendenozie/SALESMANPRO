import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { startTime, endTime, driverId, vehicleId } = await req.json();

  const conflict = await prisma.transportShift.findFirst({
    where: {
      OR: [
        { driverId },
        { vehicleId }
      ],
      // Standard overlap logic: (StartA < EndB) AND (EndA > StartB)
      startTime: { lt: new Date(endTime) },
      endTime: { gt: new Date(startTime) },
      status: { not: 'COMPLETED' }
    }
  });

  return NextResponse.json({ available: !conflict });
}