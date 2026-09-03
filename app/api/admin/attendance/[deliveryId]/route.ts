import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// // app/api/deliveries/[deliveryId]/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { DeliveryStatus, Prisma } from "@prisma/client";

export const PUT = withApiHandler(async (request, context) => {
  const { deliveryId } = context.params;
  // const userCompanyId = context.user?.companyId;
  const body = await request.json();

  // if (!userCompanyId) return formatResponse(false, null, "Unauthorized", 401);

  // OPTIMIZATION: Construct update payload leanly
  const data: Prisma.DeliveryUpdateInput = {
    ...(body.companyId && { companyId: body.companyId }),
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
        companyId: body.companyId // Security constraint
      },
      data,
      select: {
        id: true, status: true, pickupAddress: true, deliveryAddress: true,
        packageDescription: true, weightKg: true, deliveryFee: true, scheduledFor: true,
        rider: { select: { name: true } },
        companyId: true
      }
    });

    
    try {
      await cacheDel(`tenant:${updated.companyId}:attendance:*`);
      await cacheDel(`admin:attendance:*`);
    } catch (e) {}
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
  // const userCompanyId = context.user?.companyId;/
  const searchParams = new URL(request.url).searchParams;
  const companyId = searchParams.get('companyId');

  if (!companyId) return formatResponse(false, null, "Unauthorized", 401);

  try {
    // OPTIMIZATION: Atomic Delete prevents 2x round-trip
    await prisma.delivery.delete({
      where: { 
        id: deliveryId,
        companyId: companyId 
      },
    });
    
    try {
      await cacheDel(`tenant:${companyId}:attendance:*`);
      await cacheDel(`admin:attendance:*`);
    } catch (e) {}
    return formatResponse(true, null, "Delivery deleted successfully.", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, "Delivery not found or access denied.", 404);
    }
    throw error;
  }
});
