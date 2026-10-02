import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { DispatchEngine } from "@/lib/dispatch/dispatchEngine";
import { DeliveryNotificationAdapter } from "@/lib/notifications/deliveryNotificationAdapter";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// POST /api/rider/deliveries/[id]/bid: Submit or adjust delivery bid
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
    const { proposedFee, estimatedPickupMinutes, note } = body;

    if (!proposedFee || Number(proposedFee) <= 0) {
      return json({ success: false, message: "A valid positive proposed fee is required." }, 400);
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, fullName: true, verificationStatus: true },
    });

    if (!rider) {
      return json({ success: false, message: "Rider profile not found." }, 404);
    }

    if (rider.verificationStatus !== "APPROVED") {
      return json({ success: false, message: "Only verified riders can submit bids." }, 403);
    }

    const { bid } = await DispatchEngine.submitBid(
      deliveryRequestId,
      rider.id,
      Number(proposedFee),
      estimatedPickupMinutes ? Number(estimatedPickupMinutes) : undefined,
      note
    );

    // Notify store merchant of new bid
    const request = await prisma.deliveryRequest.findUnique({
      where: { id: deliveryRequestId },
      select: { companyId: true, trackingNumber: true },
    });

    if (request) {
      await DeliveryNotificationAdapter.notifyStoreNewBid({
        companyId: request.companyId,
        riderName: rider.fullName,
        proposedFee: Number(proposedFee),
        trackingNumber: request.trackingNumber,
        deliveryRequestId,
      });
    }

    return json({
      success: true,
      message: "Bid submitted successfully. The merchant will review and confirm.",
      bid,
    });
  } catch (error: any) {
    console.error("[RIDER_SUBMIT_BID_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to submit bid" }, 400);
  }
}
