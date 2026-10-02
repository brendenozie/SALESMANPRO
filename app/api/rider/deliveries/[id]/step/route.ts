import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { DispatchEngine } from "@/lib/dispatch/dispatchEngine";
import { DeliveryRequestStatus } from "@prisma/client";
import { DeliveryNotificationAdapter } from "@/lib/notifications/deliveryNotificationAdapter";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// POST /api/rider/deliveries/[id]/step: Transition active delivery step
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
    const body = await req.json();
    const { nextStatus, proof } = body;

    if (!nextStatus) {
      return json({ success: false, message: "nextStatus is required" }, 400);
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, fullName: true, userId: true },
    });

    if (!rider) {
      return json({ success: false, message: "Rider profile not found." }, 404);
    }

    // Call state machine advance
    const result = await DispatchEngine.advanceDeliveryStep(
      deliveryRequestId,
      rider.id,
      nextStatus as DeliveryRequestStatus,
      proof
    );

    // If delivery is completed, send completion notifications
    if (nextStatus === DeliveryRequestStatus.COMPLETED || nextStatus === DeliveryRequestStatus.DELIVERED) {
      const completedReq = await prisma.deliveryRequest.findUnique({
        where: { id: deliveryRequestId },
        include: { assignment: true },
      });

      if (completedReq && completedReq.assignment) {
        await DeliveryNotificationAdapter.notifyDeliveryCompleted({
          companyId: completedReq.companyId,
          riderUserId: session.user.id,
          riderName: rider.fullName,
          trackingNumber: completedReq.trackingNumber,
          netEarning: completedReq.assignment.netRiderEarning,
        });
      }
    }

    return json({
      success: true,
      message: `Delivery updated to ${nextStatus}`,
      status: result.status,
    });
  } catch (error: any) {
    console.error("[RIDER_ADVANCE_STEP_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to update delivery step" }, 400);
  }
}
