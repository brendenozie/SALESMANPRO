import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { transitionDeliveryStatus } from "@/lib/delivery-lifecycle";
import { DeliveryStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  try {
    const session = await getAuthSession();
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
      } as any,
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    const isAssigned =
      delivery.riderId === userId ||
      (delivery as any).driverProfile?.userId === userId;

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
        nextStatus: "DELIVERED" as DeliveryStatus,
        actorId: userId,
        actorName: session.user.name || "Driver",
        locationName: location?.name || delivery.deliveryAddress || undefined,
        lat: location?.lat,
        lng: location?.lng,
        note: note || `Delivered to ${recipientName}`,
        signatureUrl: proof?.signatureUrl || undefined,
        imageUrl: proof?.imageUrl || undefined,
        recipientName,
        recipientPhone: proof?.recipientPhone || delivery.customerContact || undefined,
      });

      return NextResponse.json({
        success: true,
        message: "Delivery marked as DELIVERED with proof recorded",
        delivery: result,
      });
    }

    // 2. REPORT EXCEPTION / FAILURE ACTION
    if (action === "REPORT_EXCEPTION") {
      const reason = exception?.reason || "FAILED_DELIVERY";
      const result = await transitionDeliveryStatus({
        deliveryId,
        nextStatus: "FAILED_DELIVERY" as DeliveryStatus,
        actorId: userId,
        actorName: session.user.name || "Driver",
        locationName: location?.name || undefined,
        lat: location?.lat,
        lng: location?.lng,
        failureReason: reason,
        note: `Delivery Exception: [${reason}] ${exception?.notes || note || ""}`.trim(),
      });

      // Log formal TransportIncident
      await (prisma as any).transportIncident.create({
        data: {
          companyId: delivery.companyId,
          deliveryId: delivery.id,
          driverId: (delivery as any).driverProfileId || undefined,
          vehicleId: (delivery as any).vehicleId || undefined,
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
        delivery: result,
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
      nextStatus: status as DeliveryStatus,
      actorId: userId,
      actorName: session.user.name || "Driver",
      locationName: location?.name || undefined,
      lat: location?.lat,
      lng: location?.lng,
      note: note || `Driver updated status to ${status}`,
    });

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
      delivery: result,
    });
  } catch (error: any) {
    console.error("Error in driver delivery action:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process driver action" },
      { status: 500 }
    );
  }
}
