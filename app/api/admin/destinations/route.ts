import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse, NextRequest } from 'next/server';
import prisma from "@/server/db/prismadb";
import { verifyAuth } from '@/lib/verifyAuth';
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";



// =======================================================================
// GET: Fetch all destinations with their associated location data
// =======================================================================
async function getDestinations(request: Request) {
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  const cacheKey = buildTenantCacheKey(companyId, "destinations", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const destinations = await prisma.destination.findMany({
    where: { companyId: companyId },
    include: {
      location: true,
    },
  });

  try {
    if (destinations) {
      await cacheSet(cacheKey, { data: destinations }, 60);
    }
  } catch (e) {}

  return formatResponse(true, { data: destinations }, null, 200);
}

// =======================================================================
// POST: Create a new destination
// =======================================================================
async function createDestination(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const body = await req.json();
  const {
    name,
    country,
    continent,
    description,
    longDescription,
    bannerImage,
    images,
    activities,
    bestTimeToVisit,
    averageRating,
    published,
    locationId,
    companyId
  } = body;

  if (!name || !country || !continent || !description || !locationId || !companyId) {
    return formatResponse(false, null, 'Missing required fields', 400);
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const newDestination = await prisma.destination.create({
    data: {
      name,
      slug,
      country,
      continent,
      description,
      longDescription,
      bannerImage,
      images,
      activities,
      bestTimeToVisit,
      averageRating,
      published,
      companyId,
      location: {
        connect: { id: locationId },
      },
    },
  });

  
    try {
      await cacheDel(`tenant:${companyId}:destinations:*`);
      await cacheDel(`admin:destinations:*`);
    } catch (e) {}
    return formatResponse(true, { data: newDestination }, null, 201);
}

// Export handlers with standardized wrapper
export const GET = withApiHandler(getDestinations);
export const POST = withApiHandler(createDestination);
