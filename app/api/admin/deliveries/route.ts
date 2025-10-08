// app/api/deliveries/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { DeliveryStatus, Prisma } from "@prisma/client";

/**
 * GET /api/deliveries
 * Fetches and filters the list of deliveries for a company.
 */
export const GET = withApiHandler(async (request, context) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.user?.companyId;

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required.", 400);
  }

  const searchTerm = searchParams.get("searchTerm") || "";
  const status = searchParams.get("status");

  // Build the Prisma `where` clause for filtering and searching
  const where: Prisma.DeliveryWhereInput = {
    companyId,
  };

  if (status && status !== "All") {
    where.status = status as DeliveryStatus;
  }

  if (searchTerm) {
    where.OR = [
      { trackingNumber: { contains: searchTerm, mode: 'insensitive' } },
      { pickupAddress: { contains: searchTerm, mode: 'insensitive' } },
      { deliveryAddress: { contains: searchTerm, mode: 'insensitive' } },
      { packageDescription: { contains: searchTerm, mode: 'insensitive' } },
      { rider: { name: { contains: searchTerm, mode: 'insensitive' } } },
    ];
  }

  const deliveries = await prisma.delivery.findMany({
    where,
    include: {
      rider: {
        select: { id: true, name: true },
      },
    },
    orderBy: {
      scheduledFor: 'desc',
    },
  });

  // Map the data to match the frontend's expected 'Delivery' type
  const formattedDeliveries = deliveries.map((d) => ({
    ...d,
    riderName: d.rider?.name || 'Unassigned',
  }));

  return formatResponse(true, formattedDeliveries, "Deliveries fetched successfully.", 200);
});


/**
 * POST /api/deliveries
 * Creates a new delivery record.
 */
export const POST = withApiHandler(async (request, context) => {
  const body = await request.json();
  const {
    companyId,
    trackingNumber,
    riderId,
    status,
    pickupAddress,
    deliveryAddress,
    packageDescription,
    weightKg,
    deliveryFee,
    scheduledFor,
  } = body;

  if (!companyId || !pickupAddress || !deliveryAddress || !trackingNumber) {
    return formatResponse(false, null, "Missing required fields.", 400);
  }
  
  try {
    const newDelivery = await prisma.delivery.create({
      data: {
        companyId,
        trackingNumber,
        riderId: riderId || null,
        status: status as DeliveryStatus,
        pickupAddress,
        deliveryAddress,
        packageDescription,
        weightKg: parseFloat(weightKg),
        deliveryFee: parseFloat(deliveryFee),
        scheduledFor: new Date(scheduledFor),
      },
      include: {
        rider: { select: { name: true } }
      }
    });

    const formattedDelivery = {
      ...newDelivery,
      riderName: newDelivery.rider?.name || 'Unassigned',
    };

    return formatResponse(true, formattedDelivery, "Delivery created successfully.", 201);
  } catch (error: any) {
    if (error.code === 'P2002') { // Prisma unique constraint violation
      return formatResponse(false, null, "A delivery with this tracking number already exists.", 409);
    }
    return formatResponse(false, null, "Failed to create delivery.", 500);
  }
});