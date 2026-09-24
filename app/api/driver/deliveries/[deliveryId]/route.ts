import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { transitionDeliveryStatus } from "@/lib/delivery-lifecycle";
import { DeliveryStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deliveryId } = await params;
    const body = await req.json();
    const { action, status, location, note, proof, exception } = body;

    const userId = session.user.id;

    // Check delivery ownership
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        driverProfile: true,
      },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    const isAssigned =
      delivery.riderId === userId ||
      delivery.driverProfile?.userId === userId;

    const isAdminOrStaff =
      session.user.role === "SUPER_ADMIN" ||
      session.user.role === "ADMIN" ||
      session.user.role === "STAFF";

    if (!isAssigned && !isAdminOrStaff) {
      return NextResponse.json(
        { error: "Forbidden: You are not assigned to this delivery" },
        { status: 403 }
      );
    }

    // 1. CONFIRM DELIVERY ACTION
    if (action === "CONFIRM_DELIVERY") {
      const recipientName = proof?.recipientName || delivery.customerName || "Recipient";
      const result = await transitionDeliveryStatus({
        deliveryId,
        targetStatus: DeliveryStatus.DELIVERED,
        actorId: userId,
        actorRole: "DRIVER",
        locationName: location?.name || delivery.deliveryAddress,
        lat: location?.lat,
        lng: location?.lng,
        note: note || `Delivered to ${recipientName}`,
        proof: {
          type: proof?.signatureUrl ? "SIGNATURE" : proof?.imageUrl ? "PHOTO" : "OTP",
          recipientName,
          recipientPhone: proof?.recipientPhone || delivery.customerContact || undefined,
          signatureUrl: proof?.signatureUrl || undefined,
          imageUrl: proof?.imageUrl || undefined,
          notes: proof?.notes || undefined,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Delivery marked as DELIVERED with proof recorded",
        delivery: result.delivery,
      });
    }

    // 2. REPORT EXCEPTION / FAILURE ACTION
    if (action === "REPORT_EXCEPTION") {
      const reason = exception?.reason || "FAILED_DELIVERY";
      const result = await transitionDeliveryStatus({
        deliveryId,
        targetStatus: DeliveryStatus.FAILED_DELIVERY,
        actorId: userId,
        actorRole: "DRIVER",
        locationName: location?.name,
        lat: location?.lat,
        lng: location?.lng,
        note: `Delivery Exception: [${reason}] ${exception?.notes || note || ""}`.trim(),
      });

      // Log formal TransportIncident
      await prisma.transportIncident.create({
        data: {
          companyId: delivery.companyId,
          deliveryId: delivery.id,
          driverId: delivery.driverProfileId,
          vehicleId: delivery.vehicleId,
          type: reason,
          severity: "MEDIUM",
          notes: exception?.notes || note || "Driver reported delivery failure",
          hasPhotos: Boolean(exception?.photos?.length),
          status: "OPEN",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Delivery exception reported and incident logged",
        delivery: result.delivery,
      });
    }

    // 3. REGULAR STATUS UPDATE
    if (!status) {
      return NextResponse.json(
        { error: "Target status or action required" },
        { status: 400 }
      );
    }

    const result = await transitionDeliveryStatus({
      deliveryId,
      targetStatus: status as DeliveryStatus,
      actorId: userId,
      actorRole: "DRIVER",
      locationName: location?.name,
      lat: location?.lat,
      lng: location?.lng,
      note: note || `Driver updated status to ${status}`,
    });

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
      delivery: result.delivery,
    });
  } catch (error: any) {
    console.error("Error in driver delivery action:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process driver action" },
      { status: 500 }
    );
  }
}
