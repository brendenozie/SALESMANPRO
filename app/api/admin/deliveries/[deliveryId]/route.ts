import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { transitionDeliveryStatus } from "@/lib/delivery-lifecycle";
import { DeliveryStatus } from "@prisma/client";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/admin/deliveries/[deliveryId]
export async function GET(
  req: NextRequest,
  { params }: { params: { deliveryId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { deliveryId } = params;
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        rider: { select: { id: true, name: true, email: true, phone: true } },
        vehicle: true,
        route: true,
        driverProfile: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
        CustomerOrders: {
          include: {
            items: { include: { marketplaceListing: true, product: true } },
            invoices: true,
            Payment: true,
          },
        },
        stops: { orderBy: { sequence: "asc" } },
        tracking: { orderBy: { recordedAt: "desc" } },
        proofs: { orderBy: { createdAt: "desc" } },
        incidents: { orderBy: { createdAt: "desc" } },
      } as any,
    });

    if (!delivery) {
      return json({ success: false, message: "Delivery not found" }, 404);
    }

    return json({ success: true, data: delivery });
  } catch (error: any) {
    console.error("[DELIVERY_GET_ID]", error);
    return json({ success: false, message: error.message || "Failed to fetch delivery" }, 500);
  }
}

// PATCH /api/admin/deliveries/[deliveryId]
export async function PATCH(
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

    const existingDelivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!existingDelivery) {
      return json({ success: false, message: "Delivery not found" }, 404);
    }

    // If status is transitioning, use the atomic lifecycle state machine
    if (body.status && body.status !== existingDelivery.status) {
      await transitionDeliveryStatus({
        deliveryId,
        nextStatus: body.status as DeliveryStatus,
        actorId: session.user.id,
        actorName: session.user.name || "Administrator",
        note: body.note || body.notes || `Status updated to ${body.status}`,
        lat: body.lat,
        lng: body.lng,
        locationName: body.locationName,
        failureReason: body.failureReason,
        signatureUrl: body.signatureUrl,
        imageUrl: body.imageUrl,
        recipientName: body.recipientName,
        recipientPhone: body.recipientPhone,
      });
    }

    // Update remaining properties
    const updateData: any = {};
    if (body.riderId !== undefined) {
      updateData.riderId = body.riderId || null;
      if (body.riderId) {
        const rider = await prisma.user.findUnique({
          where: { id: body.riderId },
          select: { name: true },
        });
        updateData.riderName = rider?.name || null;
      } else {
        updateData.riderName = null;
      }
    }
    if (body.vehicleId !== undefined) updateData.vehicleId = body.vehicleId || null;
    if (body.routeId !== undefined) updateData.routeId = body.routeId || null;
    if (body.pickupAddress !== undefined) updateData.pickupAddress = body.pickupAddress;
    if (body.deliveryAddress !== undefined) updateData.deliveryAddress = body.deliveryAddress;
    if (body.packageDescription !== undefined) updateData.packageDescription = body.packageDescription;
    if (body.packageValue !== undefined) updateData.packageValue = Number(body.packageValue);
    if (body.deliveryFee !== undefined) updateData.deliveryFee = Number(body.deliveryFee);
    if (body.weightKg !== undefined) updateData.weightKg = Number(body.weightKg);
    if (body.scheduledFor !== undefined) updateData.scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.deliveryInstructions !== undefined) updateData.deliveryInstructions = body.deliveryInstructions;

    const updated = await prisma.delivery.update({
      where: { id: deliveryId },
      data: updateData,
      include: {
        rider: { select: { id: true, name: true } },
        vehicle: true,
        route: true,
      },
    });

    return json({
      success: true,
      message: "Delivery updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("[DELIVERY_PATCH_ID]", error);
    return json({ success: false, message: error.message || "Failed to update delivery" }, 500);
  }
}

// PUT /api/admin/deliveries/[deliveryId] (alias to PATCH)
export async function PUT(
  req: NextRequest,
  context: { params: { deliveryId: string } }
) {
  return PATCH(req, context);
}

// DELETE /api/admin/deliveries/[deliveryId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { deliveryId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const { deliveryId } = params;
    const existing = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { CustomerOrders: true },
    });

    if (!existing) {
      return json({ success: false, message: "Delivery not found" }, 404);
    }

    // Rather than hard-deleting transactional records if orders are linked,
    // mark cancelled, unlink orders, or delete if standalone draft
    if (existing.CustomerOrders.length > 0) {
      await prisma.$transaction([
        prisma.customerOrder.updateMany({
          where: { deliveryId },
          data: {
            deliveryId: null,
            deliveryStatus: "Unassigned",
          },
        }),
        prisma.deliveryStop.deleteMany({ where: { deliveryId } }),
        prisma.deliveryTracking.deleteMany({ where: { deliveryId } }),
        prisma.deliveryProof.deleteMany({ where: { deliveryId } }),
        prisma.delivery.delete({ where: { id: deliveryId } }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.deliveryStop.deleteMany({ where: { deliveryId } }),
        prisma.deliveryTracking.deleteMany({ where: { deliveryId } }),
        prisma.deliveryProof.deleteMany({ where: { deliveryId } }),
        prisma.delivery.delete({ where: { id: deliveryId } }),
      ]);
    }

    return json({ success: true, message: "Delivery deleted successfully" });
  } catch (error: any) {
    console.error("[DELIVERY_DELETE_ID]", error);
    return json({ success: false, message: error.message || "Failed to delete delivery" }, 500);
  }
}