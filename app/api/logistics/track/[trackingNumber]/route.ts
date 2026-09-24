import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params;
    if (!trackingNumber) {
      return NextResponse.json({ error: "Tracking number required" }, { status: 400 });
    }

    const cleanTracking = trackingNumber.trim();

    // Query by trackingNumber OR orderNumber (via CustomerOrders)
    const delivery = await prisma.delivery.findFirst({
      where: {
        OR: [
          { trackingNumber: { equals: cleanTracking, mode: "insensitive" } },
          { id: cleanTracking },
          {
            CustomerOrders: {
              some: {
                orderNumber: { equals: cleanTracking, mode: "insensitive" },
              },
            },
          },
        ],
      },
      include: {
        CustomerOrders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalPrice: true,
            paymentOption: true,
            createdAt: true,
          },
        },
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            image: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
            type: true,
            status: true,
          },
        },
        driverProfile: {
          select: {
            id: true,
            rating: true,
            totalTrips: true,
          },
        },
        tracking: {
          orderBy: { recordedAt: "asc" },
        },
        proofs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        stops: {
          orderBy: { sequence: "asc" },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: `No delivery record found matching "${cleanTracking}"` },
        { status: 404 }
      );
    }

    // Build timeline milestones based on status and recorded tracking events
    const timeline = delivery.tracking.map((t) => ({
      id: t.id,
      status: t.status,
      timestamp: t.recordedAt,
      location: t.locationName || (t.lat && t.lng ? `${t.lat.toFixed(4)}, ${t.lng.toFixed(4)}` : null),
      note: t.note,
    }));

    // Sanitized driver info
    const driverInfo = delivery.rider
      ? {
          name: delivery.rider.name,
          phone: delivery.status === "OUT_FOR_DELIVERY" || delivery.status === "IN_TRANSIT"
            ? delivery.rider.phone
            : null,
          image: delivery.rider.image,
          rating: delivery.driverProfile?.rating || 5.0,
          vehicle: delivery.vehicle
            ? `${delivery.vehicle.model} (${delivery.vehicle.plateNumber})`
            : null,
        }
      : null;

    const proofOfDelivery = delivery.proofs?.[0]
      ? {
          type: delivery.proofs[0].type,
          recipientName: delivery.proofs[0].recipientName,
          signatureUrl: delivery.proofs[0].signatureUrl,
          imageUrl: delivery.proofs[0].imageUrl,
          timestamp: delivery.proofs[0].createdAt,
          notes: delivery.proofs[0].notes,
        }
      : null;

    return NextResponse.json({
      success: true,
      data: {
        trackingNumber: delivery.trackingNumber,
        status: delivery.status,
        pickupAddress: delivery.pickupAddress,
        deliveryAddress: delivery.deliveryAddress,
        packageDescription: delivery.packageDescription,
        packageWeightKg: delivery.packageWeightKg || delivery.weightKg,
        totalDistanceKm: delivery.totalDistanceKm,
        estimatedTravelTime: delivery.estimatedTravelTime,
        scheduledFor: delivery.scheduledFor,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt,
        deliveredAt: delivery.deliveredAt,
        driver: driverInfo,
        timeline,
        proofOfDelivery,
        orders: delivery.CustomerOrders,
        stopsCount: delivery.stops.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching tracking details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve tracking info" },
      { status: 500 }
    );
  }
}
