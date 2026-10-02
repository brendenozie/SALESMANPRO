import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { DispatchEngine } from "@/lib/dispatch/dispatchEngine";
import { DeliveryNotificationAdapter } from "@/lib/notifications/deliveryNotificationAdapter";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// POST /api/admin/delivery-requests/[id]/bids/[bidId]/accept
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; bidId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { id: deliveryRequestId, bidId } = params;

    const request = await prisma.deliveryRequest.findUnique({
      where: { id: deliveryRequestId },
      include: { bids: { where: { id: bidId }, include: { riderProfile: true } } },
    });

    if (!request) {
      return json({ success: false, message: "Delivery request not found" }, 404);
    }

    const targetBid = request.bids[0];
    if (!targetBid) {
      return json({ success: false, message: "Bid not found" }, 404);
    }

    // Call atomic bid acceptance in DispatchEngine
    const { assignment } = await DispatchEngine.acceptBid(
      deliveryRequestId,
      bidId,
      request.companyId
    );

    // Notify rider that their bid was accepted
    await DeliveryNotificationAdapter.notifyRiderBidAccepted({
      riderUserId: targetBid.riderProfile.userId,
      agreedFee: targetBid.proposedFee,
      pickupAddress: request.pickupAddress,
      trackingNumber: request.trackingNumber,
      deliveryRequestId,
    });

    return json({
      success: true,
      message: `Bid of KSH ${targetBid.proposedFee} accepted. Rider ${targetBid.riderProfile.fullName} has been assigned.`,
      assignment,
    });
  } catch (error: any) {
    console.error("[ADMIN_ACCEPT_BID_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to accept bid" }, 400);
  }
}
