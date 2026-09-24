import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    if (!companyId) {
      return NextResponse.json({ success: false, message: "companyId required" }, { status: 400 });
    }

    const vehicles = await prisma.transportVehicle.findMany({
      where: { companyId },
      include: {
        transportShifts: {
          where: { status: "IN_PROGRESS" },
          include: { driver: { include: { user: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = vehicles.map((v) => {
      const typeMap: any = {
        BUS: 'Heavy-Duty',
        VAN: 'Delivery Van',
        CAR: 'Medium Truck',
        MOTORCYCLE: 'Motorbike',
        HEAVY_DUTY: 'Heavy-Duty',
      };

      const statusMap: any = {
        ACTIVE: 'available',
        MAINTENANCE: 'maintenance',
        INACTIVE: 'out-of-service',
        RETIRED: 'out-of-service',
      };

      return {
        id: v.id,
        vin: `VIN-${v.registration}`,
        plateNumber: v.registration,
        model: `${v.make} ${v.model}`,
        type: typeMap[v.type] || 'Medium Truck',
        status: statusMap[v.status] || 'available',
        fuelLevel: 85,
        healthScore: 92,
        assignedDriver: v.transportShifts?.[0]?.driver?.user?.name || "Unassigned",
        lastService: "Recently Inspected",
      };
    });

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
