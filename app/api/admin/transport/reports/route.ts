import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const period = searchParams.get("period") || "current"; // current, previous

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const targetDate = period === "current" ? new Date() : subMonths(new Date(), 1);
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);

  // 1. Fuel & Financial Analysis
  
    const cacheKey = `admin:reports:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const fuelLogs = await prisma.transportFuelLog.findMany({
    where: { 
      vehicle: { companyId },
      date: { gte: monthStart, lte: monthEnd } 
    }
  });

  try {
    if (fuelLogs) {
      await cacheSet(cacheKey, fuelLogs, 60);
    }
  } catch (e) {}

  const totalFuelCost = fuelLogs.reduce((acc, log) => acc + log.cost, 0);
  const totalLiters = fuelLogs.reduce((acc, log) => acc + log.quantity, 0);

  // 2. Maintenance Expenses
  const maintenance = await prisma.transportMaintenance.aggregate({
    where: {
      vehicle: { companyId },
      completedDate: { gte: monthStart, lte: monthEnd }
    },
    _sum: { cost: true },
    _count: { id: true }
  });

  // 3. Operational Performance
  const shiftStats = await prisma.transportShift.groupBy({
    by: ['status'],
    where: {
      companyId,
      startTime: { gte: monthStart, lte: monthEnd }
    },
    _count: { id: true }
  });

  // 4. Vehicle Specific Efficiency
  const vehicleEfficiency = await prisma.transportVehicle.findMany({
    where: { companyId },
    select: {
      registration: true,
      fuelLogs: {
        where: { date: { gte: monthStart, lte: monthEnd } },
        orderBy: { odometer: 'desc' }
      }
    }
  });

  const formattedEfficiency = vehicleEfficiency.map(v => {
    const logs = v.fuelLogs;
    if (logs.length < 2) return { registration: v.registration, kml: 0 };
    
    const distance = (logs[0].odometer || 0) - (logs[logs.length - 1].odometer || 0);
    const fuelUsed = logs.reduce((sum, l) => sum + l.quantity, 0);
    return {
      registration: v.registration,
      kml: fuelUsed > 0 ? (distance / fuelUsed).toFixed(2) : 0
    };
  });

  return formatResponse(true, {
    summary: {
      totalSpending: totalFuelCost + (maintenance._sum.cost || 0),
      fuelCost: totalFuelCost,
      maintenanceCost: maintenance._sum.cost || 0,
      maintenanceCount: maintenance._count.id
    },
    shifts: shiftStats,
    efficiency: formattedEfficiency
  }, "Reports generated", 200);
}