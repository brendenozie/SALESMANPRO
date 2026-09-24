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

    const transportRoutes = await prisma.transportRoute.findMany({
      where: { companyId },
      include: {
        vehicle: true,
        transportShifts: {
          include: { driver: { include: { user: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = transportRoutes.map((r, idx) => ({
      id: r.id,
      routeCode: `RT-${r.name.slice(0, 3).toUpperCase()}-${idx + 101}`,
      origin: r.startPoint,
      destination: r.endPoint,
      status: 'active' as const,
      distance: 45,
      progress: 65,
      priority: 'Standard' as const,
      driverName: r.transportShifts?.[0]?.driver?.user?.name || "Unassigned",
      eta: "45 mins",
      cargoType: "Parcel & Freight",
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
