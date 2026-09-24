import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { transitionDeliveryStatus } from "@/lib/delivery-lifecycle";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// POST /api/admin/deliveries/[deliveryId]/assign
export async function POST(
  req: NextRequest,
  { params }: { params: { deliveryId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { deliveryId } = params;
    const body = await req.json();
    const { riderId, vehicleId, routeId, driverProfileId, scheduledFor, note } = body;

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      return json({ success: false, message: "Delivery not found" }, 404);
    }

    let resolvedRiderId = riderId || null;
    let resolvedRiderName: string | null = null;

    if (resolvedRiderId) {
      const riderUser = await prisma.user.findUnique({
        where: { id: resolvedRiderId },
        select: { name: true },
      });
      resolvedRiderName = riderUser?.name || null;
    } else if (driverProfileId) {
      const driverRecord = await prisma.transportDriver.findUnique({
        where: { id: driverProfileId },
        include: { user: { select: { id: true, name: true } } },
      });
      if (driverRecord) {
        resolvedRiderId = driverRecord.user.id;
        resolvedRiderName = driverRecord.user.name;
      }
    }

    // Update assignment details
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        riderId: resolvedRiderId,
        riderName: resolvedRiderName,
        vehicleId: vehicleId || null,
        routeId: routeId || null,
        driverProfileId: driverProfileId || null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      },
    });

    // Advance status to DRIVER_ASSIGNED via lifecycle machine
    const updated = await transitionDeliveryStatus({
      deliveryId,
      nextStatus: "DRIVER_ASSIGNED",
      actorId: session.user.id,
      actorName: session.user.name || "Administrator",
      note: note || `Driver ${resolvedRiderName || 'assigned'} allocated to delivery.`,
    });

    return json({
      success: true,
      message: "Driver and fleet assigned successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("[DELIVERY_ASSIGN_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to assign driver" }, 500);
  }
}
