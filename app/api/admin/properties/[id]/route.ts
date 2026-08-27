import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/properties/[id]/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/properties/:id
export const GET = withApiHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  const { id } = params;

   const cacheKey = `admin:properties:${id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      category: true,
      location: true,
      agent: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!property) {
    return formatResponse(false, null, "Property not found", 404);
  }

  try {
    if (property) {
      await cacheSet(cacheKey, property, 60);
    }
  } catch (e) {}

  return formatResponse(true, property, "Property fetched successfully");
});

// PUT /api/properties/:id
export const PUT = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;
  const body = await request.json();

    const cacheKey = `admin:properties:${id || 'global'}:all`;

  const {
    title,
    description,
    price,
    currency,
    type,
    status,
    categoryId,
    locationId,
    agentId,
    bedrooms,
    bathrooms,
    areaSqFt,
    plotSizeAcres,
    yearBuilt,
    address,
    photos,
    features,
  } = body;

  const updatedProperty = await prisma.property.update({
    where: { id },
    data: {
      title,
      description,
      price,
      currency,
      type,
      status,
      categoryId,
      locationId,
      agentId,
      bedrooms,
      bathrooms,
      areaSqFt,
      plotSizeAcres,
      yearBuilt,
      address,
      photos,
      features,
    },
  });

  
    try { await cacheDel(cacheKey); } catch (e) {}
    return formatResponse(true, updatedProperty, "Property updated successfully");
});

// DELETE /api/properties/:id
export const DELETE = withApiHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  const { id } = params;

  await prisma.property.delete({
    where: { id },
  });

    try { await cacheDel(`admin:properties:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Property deleted successfully");
});
