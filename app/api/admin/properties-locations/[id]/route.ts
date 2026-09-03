import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/locations/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/locations/:id
const getLocation = async (req: Request, { params }: { params: { id: string } }) => {
  
  const { id } = params;
  
    const cacheKey = buildTenantCacheKey(id, "properties-locations", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      _count: { select: { marketplaceListings: true } },
      parent: { select: { id: true, name: true } },
    },
  });

  try {
    if (location) {
      await cacheSet(cacheKey, location, 60);
    }
  } catch (e) {}

  if (!location) {
    return formatResponse(false, null, "Location not found", 404);
  }

  const formattedLocation = {
    ...location,
    propertyCount: location._count.marketplaceListings,
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
    data: { name, description, latitude, longitude, parentId:parentLocationId },
  });

  
    try {
      await cacheDel(`tenant:${id}:properties-locations:*`);
      await cacheDel(`admin:properties-locations:*`);
    } catch (e) {}
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
  
    try {
      await cacheDel(`tenant:${id}:properties-locations:*`);
      await cacheDel(`admin:properties-locations:*`);
    } catch (e) {}
    return formatResponse(true, null, "Location deleted successfully", 200);
};

// Wrap withApiHandler to unify error handling
export const GET = withApiHandler(getLocation);
export const PUT = withApiHandler(updateLocation);
export const DELETE = withApiHandler(deleteLocation);
