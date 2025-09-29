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

  const locations = await prisma.location.findMany({
    include: {
      _count: { select: { properties: true } },
      parentLocation: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  const formattedLocations = locations.map((loc) => ({
    ...loc,
    propertyCount: loc._count.properties,
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

  const newLocation = await prisma.location.create({
    data: {
      name,
      description,
      latitude,
      longitude,
      parentLocationId,
    },
  });

  return formatResponse(true, newLocation, "Location created successfully", 201);
};

export const GET = withApiHandler(getLocations);
export const POST = withApiHandler(createLocation);
