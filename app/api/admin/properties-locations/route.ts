import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/locations/route.ts
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/locations
// Fetches all locations
const getLocations = async (req: Request) => {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  
    const cacheKey = `admin:properties-locations:${'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const locations = await prisma.location.findMany({
    include: {
      _count: { select: { marketplaceListings: true } },
      parent: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  try {
    if (locations) {
      await cacheSet(cacheKey, locations, 60);
    }
  } catch (e) {}

  const formattedLocations = locations.map((loc) => ({
    ...loc,
    propertyCount: loc._count.marketplaceListings,
    _count: undefined,
  }));

  return formatResponse(true, formattedLocations, "Locations fetched successfully", 200);
};

// POST /api/locations
// Creates a new location
const createLocation = async (req: Request) => {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { name, description, latitude, longitude, parentLocationId } = await req.json();

  if (!name) {
    return formatResponse(false, null, "Location name is required", 400);
  }

  // generate a slug from the name to satisfy the required 'slug' field in the Prisma schema
  const slug = String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const newLocation = await prisma.location.create({
    data: {
      name,
      slug,
      description,
      latitude,
      longitude,
      parentId: parentLocationId,
    },
  });

  
    try { await cacheDel(`admin:properties-locations:${slug || adminSlug || 'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newLocation, "Location created successfully", 201);
};

export const GET = withApiHandler(getLocations);
export const POST = withApiHandler(createLocation);
