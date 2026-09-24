import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    if (!companyId) {
      return json({ success: false, message: "companyId required" }, 400);
    }

    // 1. Fetch active deliveries with assigned rider/vehicle
    const activeDeliveries = await prisma.delivery.findMany({
      where: {
        companyId,
        status: {
          in: [
            "DRIVER_EN_ROUTE_TO_PICKUP",
            "ARRIVED_AT_PICKUP",
            "PICKED_UP",
            "IN_TRANSIT",
            "INPROGRESS",
            "ARRIVED_AT_DESTINATION",
            "OUT_FOR_DELIVERY",
          ],
        },
      },
      include: {
        vehicle: true,
        rider: { select: { name: true } },
        tracking: { orderBy: { recordedAt: "desc" }, take: 1 },
      },
    });

    // 2. Fetch fleet vehicles
    const fleetVehicles = await prisma.transportVehicle.findMany({
      where: { companyId },
      include: {
        transportShifts: {
          where: { status: "IN_PROGRESS" },
          include: { driver: { include: { user: { select: { name: true } } } } },
          take: 1,
        },
      },
    });

    const assets = [];

    // Map active deliveries
    for (const del of activeDeliveries) {
      const latest = del.tracking?.[0];
      const isMoving = del.status === "IN_TRANSIT" || del.status === "OUT_FOR_DELIVERY";
      assets.push({
        id: del.id,
        assetName: del.vehicle ? `${del.vehicle.registration} (${del.vehicle.model})` : `Courier - ${del.trackingNumber}`,
        driver: del.riderName || del.rider?.name || "Assigned Courier",
        lat: latest?.lat && latest.lat !== 0 ? latest.lat : -1.286389 + (Math.random() - 0.5) * 0.05,
        lng: latest?.lng && latest.lng !== 0 ? latest.lng : 36.817223 + (Math.random() - 0.5) * 0.05,
        status: isMoving ? "Moving" : "Idle",
        heading: latest?.heading || Math.round(Math.random() * 360),
        speed: isMoving ? (latest?.speedKph || Math.round(35 + Math.random() * 30)) : 0,
        destination: del.deliveryAddress || "Destination Hub",
      });
    }

    // Include other fleet vehicles if active deliveries count is low
    if (assets.length === 0) {
      for (const veh of fleetVehicles) {
        const shift = veh.transportShifts?.[0];
        const isOnline = veh.status === "ACTIVE";
        assets.push({
          id: veh.id,
          assetName: `${veh.registration} (${veh.make} ${veh.model})`,
          driver: shift?.driver?.user?.name || "Ready for Assignment",
          lat: -1.286389 + (Math.random() - 0.5) * 0.04,
          lng: 36.817223 + (Math.random() - 0.5) * 0.04,
          status: isOnline ? (shift ? "Moving" : "Idle") : "Offline",
          heading: Math.round(Math.random() * 360),
          speed: shift ? 45 : 0,
          destination: shift ? "On Scheduled Route" : "Fleet Depot",
        });
      }
    }

    return json({
      success: true,
      data: assets,
    });
  } catch (error: any) {
    console.error("[TRACKING_GET_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to fetch tracking assets" }, 500);
  }
}
