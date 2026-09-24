import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "active"; // "active" | "completed" | "all"

    const userId = session.user.id;

    // Find driver record if exists
    const transportDriver = await prisma.transportDriver.findFirst({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    let assignedVehicle = null;
    if (transportDriver?.vehicleId) {
      assignedVehicle = await prisma.transportVehicle.findUnique({
        where: { id: transportDriver.vehicleId },
        select: {
          id: true,
          plateNumber: true,
          model: true,
          type: true,
          status: true,
        },
      });
    }

    const driverProfileId = transportDriver?.id;

    // Build status filter
    const activeStatuses = [
      "DRIVER_ASSIGNED",
      "ASSIGNED",
      "DRIVER_EN_ROUTE_TO_PICKUP",
      "ARRIVED_AT_PICKUP",
      "PICKED_UP",
      "IN_TRANSIT",
      "INPROGRESS",
      "ARRIVED_AT_DESTINATION",
      "OUT_FOR_DELIVERY",
    ];

    const completedStatuses = ["DELIVERED", "COMPLETED"];

    let statusCondition: any = undefined;
    if (filter === "active") {
      statusCondition = { in: activeStatuses };
    } else if (filter === "completed") {
      statusCondition = { in: completedStatuses };
    }

    // Query deliveries assigned to this driver
    const deliveries = await prisma.delivery.findMany({
      where: {
        OR: [
          { riderId: userId },
          ...(driverProfileId ? [{ driverProfileId }] : []),
        ],
        ...(statusCondition ? { status: statusCondition } : {}),
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
          },
        },
        stops: {
          orderBy: { sequence: "asc" },
        },
        tracking: {
          orderBy: { recordedAt: "desc" },
          take: 3,
        },
        proofs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { scheduledFor: "asc" },
    });

    // Compute stats
    const [totalActive, totalCompletedToday] = await Promise.all([
      prisma.delivery.count({
        where: {
          OR: [
            { riderId: userId },
            ...(driverProfileId ? [{ driverProfileId }] : []),
          ],
          status: { in: activeStatuses },
        },
      }),
      prisma.delivery.count({
        where: {
          OR: [
            { riderId: userId },
            ...(driverProfileId ? [{ driverProfileId }] : []),
          ],
          status: { in: completedStatuses },
          updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      driver: {
        id: driverProfileId || userId,
        name: session.user.name,
        email: session.user.email,
        vehicle: transportDriver?.vehicle || null,
        status: transportDriver?.status || "AVAILABLE",
        stats: {
          activeDeliveries: totalActive,
          completedToday: totalCompletedToday,
          rating: transportDriver?.rating || 5.0,
        },
      },
      deliveries: deliveries.map((d) => ({
        id: d.id,
        trackingNumber: d.trackingNumber,
        status: d.status,
        customerName: d.customerName,
        customerContact: d.customerContact,
        pickupAddress: d.pickupAddress,
        deliveryAddress: d.deliveryAddress,
        deliveryInstructions: d.deliveryInstructions,
        packageDescription: d.packageDescription,
        packageWeightKg: d.packageWeightKg || d.weightKg,
        totalDistanceKm: d.totalDistanceKm,
        estimatedTravelTime: d.estimatedTravelTime,
        scheduledFor: d.scheduledFor,
        notes: d.notes,
        vehicle: d.vehicle ? `${d.vehicle.model} (${d.vehicle.plateNumber})` : null,
        stopsCount: d.stops.length,
        hasProof: d.proofs.length > 0,
        proof: d.proofs[0] || null,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching driver deliveries:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch driver deliveries" },
      { status: 500 }
    );
  }
}
