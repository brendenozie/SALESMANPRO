import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { startOfDay, subDays } from "date-fns";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const cacheKey = buildTenantCacheKey(companyId, "analytics", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  try {
    // 1. Calculate Occupancy Rate
    // Get total capacity across all blocks for this company
    const totalBeds = await prisma.hostelRoom.aggregate({
      where: { block: { companyId } },
      _sum: { capacity: true }
    });

    // Count currently active allocations
   
  const activeAllocations = await prisma.hostelAllocation.count({
      where: { 
        status: "ACTIVE",
        room: { block: { companyId } }
      }
    });

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

    try {
      const analyticsData = {
        occupancy: `${occupancyRate}%`,
        mttr: `${mttr} hrs`,
        visitors: visitorCount,
        activeStaff: onDutyStaff,
        wingData
      };

      await cacheSet(cacheKey, analyticsData, 60);
    } catch (e) {
      console.error("Error caching analytics data:", e);
    }

    return formatResponse(true, {
        occupancy: `${occupancyRate}%`,
        mttr: `${mttr} hrs`,
        visitors: visitorCount.toString(),
        activeStaff: onDutyStaff,
        wingData
    }, "Analytics fetched successfully", 200);
    
  } catch (error) {
    console.error("REPORTS_API_ERROR", error);
    return formatResponse(false, null, "Analytics failed", 500);
  }
}