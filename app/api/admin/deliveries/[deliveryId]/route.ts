import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/deliveries/[deliveryId]/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { DeliveryStatus, Prisma } from "@prisma/client";

export const PUT = withApiHandler(async (request, context) => {
  const deliveryId = context.params.deliveryId;
  const userCompanyId = context.user?.companyId;
  const body = await request.json();

  const deliveryToUpdate = await prisma.delivery.findUnique({
    where: { id: deliveryId },
  });

  // Security check: ensure the delivery belongs to the user's company
  if (!deliveryToUpdate || deliveryToUpdate.companyId !== userCompanyId) {
    return formatResponse(false, null, "Delivery not found or access denied.", 404);
  }
  
  // Prepare data for the update payload
  const dataToUpdate: Prisma.DeliveryUpdateInput = {};
  if (body.status) dataToUpdate.status = body.status as DeliveryStatus;
  if (body.riderId !== undefined) {
    dataToUpdate.rider = body.riderId
      ? { connect: { id: body.riderId } }
      : { disconnect: true };
  }
  if (body.pickupAddress) dataToUpdate.pickupAddress = body.pickupAddress;
  if (body.deliveryAddress) dataToUpdate.deliveryAddress = body.deliveryAddress;
  if (body.packageDescription) dataToUpdate.packageDescription = body.packageDescription;
  if (body.weightKg) dataToUpdate.weightKg = parseFloat(body.weightKg);
  if (body.deliveryFee) dataToUpdate.deliveryFee = parseFloat(body.deliveryFee);
  if (body.scheduledFor) dataToUpdate.scheduledFor = new Date(body.scheduledFor);
  
  const updatedDelivery = await prisma.delivery.update({
    where: { id: deliveryId },
    data: dataToUpdate,
    include: {
        rider: { select: { name: true } }
    }
  });

  const formattedDelivery = {
    ...updatedDelivery,
    riderName: updatedDelivery.rider?.name || 'Unassigned',
  };

    try { await cacheDel(`admin:deliveries:${deliveryId || 'global'}:*`); } catch (e) {}

    return formatResponse(true, formattedDelivery, "Delivery updated successfully.", 200);
});



export const DELETE = withApiHandler(async (request, context) => {
  const deliveryId = context.params.deliveryId;
  const userCompanyId = context.user?.companyId;

  const deliveryToDelete = await prisma.delivery.findUnique({
    where: { id: deliveryId },
  });

  // Security check
  if (!deliveryToDelete || deliveryToDelete.companyId !== userCompanyId) {
    return formatResponse(false, null, "Delivery not found or access denied.", 404);
  }

  await prisma.delivery.delete({
    where: { id: deliveryId },
  });

  
    try { await cacheDel(`admin:deliveries:${deliveryId || 'global'}:*`); } catch (e) {}

    return formatResponse(true, null, "Delivery deleted successfully.", 200);
});