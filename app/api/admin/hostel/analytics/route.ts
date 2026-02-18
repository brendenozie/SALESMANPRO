import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { startOfDay, subDays } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return NextResponse.json({ error: "Company ID required" }, { status: 400 });

  try {
    // 1. Calculate Occupancy Rate
    // Get total capacity across all blocks for this company
    const totalBeds = await prisma.hostelRoom.aggregate({
      where: { block: { companyId } },
      _sum: { capacity: true }
    });

    // Count currently active allocations
    
    const cacheKey = `admin:analytics:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const activeAllocations = await prisma.hostelAllocation.count({
      where: { 
        status: "ACTIVE",
        room: { block: { companyId } }
      }
    });

  try {
    if (activeAllocations) {
      await cacheSet(cacheKey, activeAllocations, 60);
    }
  } catch (e) {}

    const totalCapacity = totalBeds._sum.capacity || 0;
    const occupancyRate = totalCapacity > 0 
      ? ((activeAllocations / totalCapacity) * 100).toFixed(1) 
      : "0";

    // 2. MTTR (Mean Time To Repair)
    // Filter by 'RESOLVED' (or COMPLETED) status based on your enum
    const resolvedTickets = await prisma.hostelMaintenanceRequest.findMany({
      where: { 
        room: { block: { companyId } },
        status: "COMPLETED", // Ensure this matches your enum value
        resolvedDate: { not: null } 
      },
      select: { createdAt: true, resolvedDate: true }
    });
    
    const totalRepairTime = resolvedTickets.reduce((acc, ticket) => {
      if (!ticket.resolvedDate) return acc;
      return acc + (ticket.resolvedDate.getTime() - ticket.createdAt.getTime());
    }, 0);

    const mttr = resolvedTickets.length > 0 
      ? (totalRepairTime / resolvedTickets.length / 3600000).toFixed(1) 
      : "0";

    // 3. Visitor Volume (Last 7 Days)
    const sevenDaysAgo = subDays(startOfDay(new Date()), 7);
    const visitorCount = await prisma.hostelVisitor.count({
      where: { companyId, checkIn: { gte: sevenDaysAgo } }
    });

    // 4. Dynamic Wing/Block Data
    const blocks = await prisma.hostelBlock.findMany({
      where: { companyId },
      include: {
        rooms: {
          include: {
            allocations: { where: { status: "ACTIVE" } }
          }
        }
      }
    });

    const wingData = blocks.map((block, index) => {
      const blockCapacity = block.rooms.reduce((acc, r) => acc + r.capacity, 0);
      const blockOccupancy = block.rooms.reduce((acc, r) => acc + r.allocations.length, 0);
      const percentage = blockCapacity > 0 ? Math.round((blockOccupancy / blockCapacity) * 100) : 0;
      
      const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-slate-700'];
      
      return {
        label: block.name,
        val: percentage,
        color: colors[index % colors.length]
      };
    });

    // 5. Staff Overview (Bonus context)
    const onDutyStaff = await prisma.hostelStaff.count({
        where: { companyId, isOnDuty: true }
    });

    return NextResponse.json({
      data: {
        occupancy: `${occupancyRate}%`,
        mttr: `${mttr} hrs`,
        visitors: visitorCount.toString(),
        activeStaff: onDutyStaff,
        wingData
      }
    });
  } catch (error) {
    console.error("REPORTS_API_ERROR", error);
    return NextResponse.json({ error: "Analytics failed" }, { status: 500 });
  }
}