import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/rider/deliveries/active: Get currently assigned active delivery for rider
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, activeDeliveryRequestId: true },
    });

    if (!rider) {
      return json({ success: false, message: "Rider profile not found." }, 404);
    }

    if (!rider.activeDeliveryRequestId) {
      return json({ success: true, hasActiveDelivery: false, delivery: null });
    }

    const request = await prisma.deliveryRequest.findUnique({
      where: { id: rider.activeDeliveryRequestId },
      include: {
        company: {
          select: { name: true, contactPhone: true, contactEmail: true, logoUrl: true },
        },
        assignment: true,
      },
    });

    if (!request || !request.assignment) {
      // Clear inconsistent state if request was cancelled
      await prisma.riderProfile.update({
        where: { id: rider.id },
        data: { activeDeliveryRequestId: null },
      });
      return json({ success: true, hasActiveDelivery: false, delivery: null });
    }

    return json({
      success: true,
      hasActiveDelivery: true,
      delivery: {
        id: request.id,
        trackingNumber: request.trackingNumber,
        status: request.status,
        store: {
          name: request.company.name,
          phone: request.pickupContactPhone || request.company.contactPhone,
          address: request.pickupAddress,
          lat: request.pickupLat,
          lng: request.pickupLng,
          instructions: request.pickupInstructions,
        },
        dropoff: {
          customerName: request.dropoffContactName,
          customerPhone: request.dropoffContactPhone,
          address: request.dropoffAddress,
          lat: request.dropoffLat,
          lng: request.dropoffLng,
          instructions: request.dropoffInstructions,
        },
        package: {
          description: request.packageDescription,
          weightKg: request.packageWeightKg,
          dimensions: request.packageDimensions,
        },
        financials: {
          agreedFee: request.assignment.agreedFee,
          platformCommission: request.assignment.platformCommission,
          netEarnings: request.assignment.netRiderEarning,
        },
        assignedAt: request.assignment.assignedAt,
        pickupConfirmedAt: request.assignment.pickupConfirmedAt,
      },
    });
  } catch (error: any) {
    console.error("[RIDER_ACTIVE_DELIVERY_GET_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to load active delivery" }, 500);
  }
}
