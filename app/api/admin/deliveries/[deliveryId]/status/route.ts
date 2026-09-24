import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { transitionDeliveryStatus } from "@/lib/delivery-lifecycle";
import { DeliveryStatus } from "@prisma/client";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// POST or PATCH /api/admin/deliveries/[deliveryId]/status
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
    const {
      status,
      note,
      lat,
      lng,
      locationName,
      failureReason,
      signatureUrl,
      imageUrl,
      recipientName,
      recipientPhone,
    } = body;

    if (!status) {
      return json({ success: false, message: "Status is required" }, 400);
    }

    const updated = await transitionDeliveryStatus({
      deliveryId,
      nextStatus: status as DeliveryStatus,
      actorId: session.user.id,
      actorName: session.user.name || "Staff",
      note,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      locationName,
      failureReason,
      signatureUrl,
      imageUrl,
      recipientName,
      recipientPhone,
    });

    return json({
      success: true,
      message: `Status updated to ${status}`,
      data: updated,
    });
  } catch (error: any) {
    console.error("[DELIVERY_STATUS_TRANSITION_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to update status" }, 500);
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { deliveryId: string } }
) {
  return POST(req, context);
}
