import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { DispatchEngine } from "@/lib/dispatch/dispatchEngine";
import { DeliveryNotificationAdapter } from "@/lib/notifications/deliveryNotificationAdapter";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// POST /api/rider/deliveries/[id]/accept: Accept fixed-fee delivery offer
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { id: deliveryRequestId } = params;

    const rider = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, fullName: true, phone: true, verificationStatus: true },
    });

    if (!rider) {
      return json({ success: false, message: "Rider profile not found." }, 404);
    }

    if (rider.verificationStatus !== "APPROVED") {
      return json({ success: false, message: "Account not verified for deliveries." }, 403);
    }

    // Call atomic acceptance in DispatchEngine
    const { assignment, request } = await DispatchEngine.acceptDeliveryOffer(
      deliveryRequestId,
      rider.id
    );

    // Notify store owner
    await DeliveryNotificationAdapter.notifyStoreRiderAssigned({
      companyId: request.companyId,
      riderName: rider.fullName,
      riderPhone: rider.phone,
      trackingNumber: request.trackingNumber,
      deliveryRequestId: request.id,
    });

    return json({
      success: true,
      message: "Delivery offer accepted successfully! Proceed to pickup address.",
      assignment,
    });
  } catch (error: any) {
    console.error("[RIDER_ACCEPT_DELIVERY_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to accept delivery offer" }, 400);
  }
}
