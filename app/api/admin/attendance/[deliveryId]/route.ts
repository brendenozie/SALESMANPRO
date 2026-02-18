import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/deliveries/[deliveryId]/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { DeliveryStatus, Prisma } from "@prisma/client";

export const PUT = withApiHandler(async (request, context) => {
  const { deliveryId } = context.params;
  const userCompanyId = context.user?.companyId;
  const body = await request.json();

  if (!userCompanyId) return formatResponse(false, null, "Unauthorized", 401);

  // OPTIMIZATION: Construct update payload leanly
  const data: Prisma.DeliveryUpdateInput = {
    ...(body.status && { status: body.status as DeliveryStatus }),
    ...(body.pickupAddress && { pickupAddress: body.pickupAddress }),
    ...(body.deliveryAddress && { deliveryAddress: body.deliveryAddress }),
    ...(body.packageDescription && { packageDescription: body.packageDescription }),
    ...(body.weightKg && { weightKg: parseFloat(body.weightKg) }),
    ...(body.deliveryFee && { deliveryFee: parseFloat(body.deliveryFee) }),
    ...(body.scheduledFor && { scheduledFor: new Date(body.scheduledFor) }),
    ...(body.riderId !== undefined && {
      rider: body.riderId ? { connect: { id: body.riderId } } : { disconnect: true }
    }),
  };

  try {
    // OPTIMIZATION: Atomic Update. Checks ID and Company ownership in ONE query.
    const updated = await prisma.delivery.update({
      where: { 
        id: deliveryId,
        companyId: userCompanyId // Security constraint
      },
      data,
      select: {
        id: true, status: true, pickupAddress: true, deliveryAddress: true,
        packageDescription: true, weightKg: true, deliveryFee: true, scheduledFor: true,
        rider: { select: { name: true } }
      }
    });

    
    try { await cacheDel(`admin:attendance:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, {
      ...updated,
      riderName: updated.rider?.name || 'Unassigned'
    }, "Delivery updated successfully.", 200);

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Delivery not found or access denied.", 404);
    }
    throw error;
  }
});

export const DELETE = withApiHandler(async (request, context) => {
  const { deliveryId } = context.params;
  const userCompanyId = context.user?.companyId;

  try {
    // OPTIMIZATION: Atomic Delete prevents 2x round-trip
    await prisma.delivery.delete({
      where: { 
        id: deliveryId,
        companyId: userCompanyId 
      },
    });
    
    try { await cacheDel(`admin:attendance:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Delivery deleted successfully.", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Delivery not found or access denied.", 404);
    }
    throw error;
  }
});


//   // Security check: ensure the delivery belongs to the user's company
//   if (!deliveryToUpdate || deliveryToUpdate.companyId !== userCompanyId) {
//     return formatResponse(false, null, "Delivery not found or access denied.", 404);
//   }
  
//   // Prepare data for the update payload
//   const dataToUpdate: Prisma.DeliveryUpdateInput = {};
//   if (body.status) dataToUpdate.status = body.status as DeliveryStatus;
//   if (body.riderId !== undefined) {
//     dataToUpdate.rider = body.riderId
//       ? { connect: { id: body.riderId } }
//       : { disconnect: true };
//   }
//   if (body.pickupAddress) dataToUpdate.pickupAddress = body.pickupAddress;
//   if (body.deliveryAddress) dataToUpdate.deliveryAddress = body.deliveryAddress;
//   if (body.packageDescription) dataToUpdate.packageDescription = body.packageDescription;
//   if (body.weightKg) dataToUpdate.weightKg = parseFloat(body.weightKg);
//   if (body.deliveryFee) dataToUpdate.deliveryFee = parseFloat(body.deliveryFee);
//   if (body.scheduledFor) dataToUpdate.scheduledFor = new Date(body.scheduledFor);
  
//   const updatedDelivery = await prisma.delivery.update({
//     where: { id: deliveryId },
//     data: dataToUpdate,
//     include: {
//         rider: { select: { name: true } }
//     }
//   });

//   const formattedDelivery = {
//     ...updatedDelivery,
//     riderName: updatedDelivery.rider?.name || 'Unassigned',
//   };

//   return formatResponse(true, formattedDelivery, "Delivery updated successfully.", 200);
// });


// 
// export const DELETE = withApiHandler(async (request, context) => {
//   const deliveryId = context.params.deliveryId;
//   const userCompanyId = context.user?.companyId;

//   const deliveryToDelete = await prisma.delivery.findUnique({
//     where: { id: deliveryId },
//   });

//   // Security check
//   if (!deliveryToDelete || deliveryToDelete.companyId !== userCompanyId) {
//     return formatResponse(false, null, "Delivery not found or access denied.", 404);
//   }

//   await prisma.delivery.delete({
//     where: { id: deliveryId },
//   });

//   return formatResponse(true, null, "Delivery deleted successfully.", 200);
// });