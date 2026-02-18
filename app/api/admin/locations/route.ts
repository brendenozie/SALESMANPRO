import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { getAuthSession } from "@/lib/auth"; // Used to fetch session for createdBy field

// --- GET Handler ---

async function handleGetLocations(request: Request) {
  // Although authentication is handled by withApiHandler, the user session
  // is often needed inside the handler logic (e.g., filtering based on user role/permissions).
  // We'll proceed with fetching all, as the original code did.

  
    const cacheKey = `admin:locations:${slug || adminSlug || 'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const rawLocations = await prisma.location.findMany({
    orderBy: {
      sortOrder: 'asc', // Order by sortOrder for consistent list/tree building
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
      latitude: true,
      longitude: true,
      seoTitle: true,
      seoDescription: true,
      metaKeywords: true,
      sortOrder: true,
      visible: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      updatedBy: true,
      status: true,
      parentId: true,
      localization: true,
      attributes: true,
    },
  });

  try {
    if (rawLocations) {
      await cacheSet(cacheKey, rawLocations, 60);
    }
  } catch (e) {}

   const locations = rawLocations.map((loc) => ({
      ...loc,
      name: loc.name ?? "Unnamed Location",
      slug: loc.slug ?? `location-${loc.id}`,
      description: loc.description ?? "",
      country: loc.country ?? "Unknown",
    }));

    // return formatResponse(true, locations, "Locations fetched successfully", 20);


  // withApiHandler will wrap this result in formatResponse(true, { data: locations }) with status 200
  return formatResponse(true, { data: locations }, "Locations fetched successfully", 200);
}

// --- POST Handler ---

async function handlePostLocation(request: Request) {
  // Fetch session data again to reliably get the userId for the 'createdBy' field,
  // which is separate from the basic auth check performed by withApiHandler.
  const session = await getAuthSession();
  const userId = session?.user?.id;

  const {
    name,
    slug,
    description,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    latitude,
    longitude,
    seoTitle,
    seoDescription,
    metaKeywords,
    sortOrder,
    visible,
    parentId,
    localization,
    attributes,
    status,
  } = await request.json();

  // Basic validation
  if (!name || !slug) {
    return formatResponse(false, null, "Name and slug are required", 400);
  }

  // Ensure slug is unique
  const existingLocation = await prisma.location.findUnique({
    where: { slug },
  });
  if (existingLocation) {
    return formatResponse(false, null, `Location with slug '${slug}' already exists`, 409);
  }

  const newLocation = await prisma.location.create({
    data: {
      name,
      slug,
      description,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      latitude,
      longitude,
      seoTitle,
      seoDescription,
      metaKeywords: metaKeywords || [],
      sortOrder: sortOrder ?? 0,
      visible: visible ?? true,
      createdBy: userId, // Use authenticated user ID
      status: status ?? 'ACTIVE',
      parentId: parentId || null,
      localization: localization || null,
      attributes: attributes || null,
    },
  });

  // Return success response with status 201 via formatResponse wrapped by withApiHandler
  
    try { await cacheDel(`admin:locations:${slug || adminSlug || 'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newLocation, null, 201);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(handleGetLocations);
export const POST = withApiHandler(handlePostLocation);
