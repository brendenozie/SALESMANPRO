import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// POST /api/rider/location: Authenticated GPS tracking update
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const { lat, lng, heading, speedKph } = body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return json({ success: false, message: "Valid numeric latitude and longitude required." }, 400);
    }

    // Latitude must be -90 to 90, Longitude -180 to 180
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return json({ success: false, message: "Coordinates out of geographic range." }, 400);
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, activeDeliveryRequestId: true },
    });

    if (!rider) {
      return json({ success: false, message: "Rider profile not found." }, 404);
    }

    const now = new Date();

    // 1. Update rider profile current location
    await prisma.riderProfile.update({
      where: { id: rider.id },
      data: {
        currentLat: lat,
        currentLng: lng,
        heading: typeof heading === "number" ? heading : null,
        speedKph: typeof speedKph === "number" ? speedKph : null,
        locationUpdatedAt: now,
      },
    });

    // 2. If rider is currently executing an active delivery, log real-time delivery tracking point
    if (rider.activeDeliveryRequestId) {
      const activeReq = await prisma.deliveryRequest.findUnique({
        where: { id: rider.activeDeliveryRequestId },
        select: { deliveryId: true },
      });

      if (activeReq?.deliveryId) {
        await prisma.deliveryTracking.create({
          data: {
            deliveryId: activeReq.deliveryId,
            riderId: session.user.id,
            lat,
            lng,
            heading: typeof heading === "number" ? heading : null,
            speedKph: typeof speedKph === "number" ? speedKph : null,
            status: "IN_TRANSIT",
            recordedAt: now,
          },
        });
      }
    }

    return json({
      success: true,
      timestamp: now.toISOString(),
      recorded: { lat, lng },
    });
  } catch (error: any) {
    console.error("[RIDER_LOCATION_POST_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to update location" }, 500);
  }
}
