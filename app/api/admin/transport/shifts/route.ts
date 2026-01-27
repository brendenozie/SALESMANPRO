import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const dateStr = searchParams.get("date"); // Optional: filter by date

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  // If date is provided, filter from 00:00 to 23:59 of that day
  const dateFilter = dateStr ? {
    startTime: {
      gte: new Date(`${dateStr}T00:00:00.000Z`),
      lte: new Date(`${dateStr}T23:59:59.999Z`),
    }
  } : {};

  const shifts = await prisma.transportShift.findMany({
    where: { companyId, ...dateFilter },
    include: {
      route: { select: { name: true, startPoint: true, endPoint: true } },
      driver: { select: { user: { select: { name: true } } } },
      // phoneNumber: true
      vehicle: { select: { registration: true, type: true } }
    },
    orderBy: { startTime: 'asc' }
  });

  return formatResponse(true, shifts, "Shifts retrieved successfully", 200);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { routeId, driverId, vehicleId, startTime, endTime, companyId } = body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. CONFLICT VALIDATION: Check if Driver or Vehicle is already busy
    const conflict = await prisma.transportShift.findFirst({
      where: {
        companyId,
        status: { not: "CANCELLED" },
        OR: [
          { driverId },
          { vehicleId }
        ],
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } }
        ]
      },
      include: {
        driver: { select: { user: {
          select: { name: true }
        } } },
        vehicle: { select: { registration: true } }
      }
    });

    if (conflict) {
      const entity = conflict.driverId === driverId ? `Driver (${conflict.driver.user.name})` : `Vehicle (${conflict.vehicle.registration})`;
      return formatResponse(false, null, `${entity} is already booked for this time slot.`, 409);
    }

    // 2. CREATE SHIFT
    const newShift = await prisma.transportShift.create({
      data: {
        routeId,
        driverId,
        vehicleId,
        startTime: start,
        endTime: end,
        companyId,
        status: "SCHEDULED"
      },
      include: {
        route: { select: { name: true } },
        driver: { select: { user: { select: { name: true } } } },
        vehicle: { select: { registration: true } }
      }
    });

    return formatResponse(true, newShift, "Shift authorized and dispatched", 201);
  } catch (error: any) {
    console.error("SHIFT_POST_ERROR", error);
    return formatResponse(false, null, error.message, 500);
  }
}