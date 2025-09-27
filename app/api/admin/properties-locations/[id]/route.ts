// app/api/locations/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/locations/:id
const getLocation = async (req: Request, { params }: { params: { id: string } }) => {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      _count: { select: { properties: true } },
      parentLocation: { select: { id: true, name: true } },
    },
  });

  if (!location) {
    return formatResponse(false, null, "Location not found", 404);
  }

  const formattedLocation = {
    ...location,
    propertyCount: location._count.properties,
    _count: undefined,
  };

  return formatResponse(true, formattedLocation, "Location fetched successfully", 200);
};

// PUT /api/locations/:id
const updateLocation = async (req: Request, { params }: { params: { id: string } }) => {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const { name, description, latitude, longitude, parentLocationId } = await req.json();

  const updatedLocation = await prisma.location.update({
    where: { id },
    data: { name, description, latitude, longitude, parentLocationId },
  });

  return formatResponse(true, updatedLocation, "Location updated successfully", 200);
};

// DELETE /api/locations/:id
const deleteLocation = async (req: Request, { params }: { params: { id: string } }) => {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  const propertiesCount = await prisma.property.count({ where: { locationId: id } });
  if (propertiesCount > 0) {
    return formatResponse(false, null, `Cannot delete location. It is associated with ${propertiesCount} properties.`, 409);
  }

  await prisma.location.delete({ where: { id } });
  return formatResponse(true, null, "Location deleted successfully", 200);
};

// Wrap withApiHandler to unify error handling
export const GET = withApiHandler(getLocation);
export const PUT = withApiHandler(updateLocation);
export const DELETE = withApiHandler(deleteLocation);
