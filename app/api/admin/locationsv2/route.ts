import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// Define the expected structure for route parameters (although not used in URL, the structure is necessary for type safety)
type RouteParams = { params: { adminSlug: string } };

// A robust slugify function to create a URL-friendly string from a name.
const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD') // Normalize characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-');      // Replace multiple - with single -
};

// --- GET Handler Core Logic ---

async function handleGetLocations(req: Request, { params }: RouteParams) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    // Custom validation error, explicitly using formatResponse
    return formatResponse(false, null, "companyId is required", 400);
  }

  // Fetch company-specific associations
  
    const cacheKey = `admin:locationsv2:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const companyLocations = await prisma.companyLocation.findMany({
    where: { companyId },
    include: { location: true },
    orderBy: { sortOrder: "asc" },
  });

  try {
    if (companyLocations) {
      await cacheSet(cacheKey, companyLocations, 60);
    }
  } catch (e) {}

  // Identify and fetch parent location details for locations that are not explicitly
  // listed as CompanyLocations themselves (for tree structure display)
  const missingParentIds = companyLocations
    .map((cl) => cl.location?.parentId)
    .filter((pid): pid is string => !!pid && !companyLocations.find((cl) => cl.locationId === pid));

  let parentLocations: any[] = [];
  if (missingParentIds.length > 0) {
    parentLocations = await prisma.location.findMany({
      where: { id: { in: missingParentIds } },
    });
  }

  // Format company locations (prioritizing overrides from CompanyLocation)
  const formattedCompanyLocs = companyLocations.map((cl) => {
    const loc = cl.location;
    // Check if loc exists before accessing properties (safe access)
    if (!loc) return null;

    return {
      id: cl.id,
      locationId: loc.id,
      parentId: loc.parentId,
      name: cl.displayName || loc.name,
      slug: loc.slug,
      description: loc.description,
      addressLine1: cl.addressLine1Override || loc.addressLine1,
      addressLine2: cl.addressLine2Override || loc.addressLine2,
      city: cl.cityOverride || loc.city,
      state: cl.stateOverride || loc.state,
      postalCode: cl.postalCodeOverride || loc.postalCode,
      country: cl.countryOverride || loc.country,
      latitude: cl.latitudeOverride ?? loc.latitude,
      longitude: cl.longitudeOverride ?? loc.longitude,
      imageUrl: loc.imageUrl,
      phone: loc.phone,
      email: loc.email,
      capacity: loc.capacity,
      openHours: loc.openHours,
      status: loc.status,
      sortOrder: cl.sortOrder ?? loc.sortOrder,
      visible: cl.visible ?? loc.visible,
      createdAt: cl.createdAt,
      updatedAt: cl.updatedAt,
      isParent: false, // Mark as company association
    };
  }).filter(Boolean); // Filter out any null returns

  // Format fallback parent locations (no overrides)
  const formattedParents = parentLocations.map((loc) => ({
    id: loc.id, // base ID since no companyLocation
    locationId: loc.id,
    parentId: loc.parentId,
    name: loc.name,
    slug: loc.slug,
    // ... include all other necessary fields from Location model
    isParent: true, // mark fallback parents
    ...loc, // Spread the rest of the fields
  }));

  // withApiHandler will wrap this result in formatResponse(true, { data: combined_list }) with status 200
  return formatResponse(true, { data: [...formattedCompanyLocs, ...formattedParents] }, "Locations fetched successfully", 200);
}

// --- POST Handler Core Logic ---

async function handlePostLocation(request: Request, { params }: RouteParams) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  const body = await request.json();
  const {
    name,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    description,
    imageUrl,
    phone,
    email,
    capacity,
    openHours,
    status,
  } = body;

  if (!companyId) {
    return formatResponse(false, null, "Missing companyId.", 400);
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, "Company not found for the given id.", 404);
  }

  if (!name || !city || !country) {
    return formatResponse(false, null, "Name, city, and country are required.", 400);
  }

  // Generate slug and ensure uniqueness in Location model
  let generatedSlug = slugify(name);
  let suffix = 1;
  while (
    await prisma.location.findUnique({
      where: { slug: generatedSlug },
    })
  ) {
    generatedSlug = `${slugify(name)}-${suffix}`;
    suffix++;
  }

  // 1. Create Location first
  const newLocation = await prisma.location.create({
    data: {
      name,
      slug: generatedSlug,
      description: description || null,
      imageUrl: imageUrl || null,
      phone: phone || null,
      email: email || null,
      capacity: capacity ? parseInt(capacity) : null,
      openHours: openHours || null,
      status: status || "OPEN",
      // Company association is handled through CompanyLocation for many-to-many relationship
      addressLine1: addressLine1 || null,
      addressLine2: addressLine2 || null,
      city,
      state: state || null,
      postalCode: postalCode || null,
      country,
    },
  });

  // 2. Create CompanyLocation link
  const companyLocation = await prisma.companyLocation.create({
    data: {
      company: { connect: { id: companyId } },
      location: { connect: { id: newLocation.id } },
    },
    include: { location: true },
  });

  // Format for frontend
  const formatted = {
    id: companyLocation.id,
    displayName: companyLocation.displayName || newLocation.name,
    slug: newLocation.slug,
    addressLine1: companyLocation.addressLine1Override || newLocation.addressLine1,
    addressLine2: companyLocation.addressLine2Override || newLocation.addressLine2,
    city: companyLocation.cityOverride || newLocation.city,
    state: companyLocation.stateOverride || newLocation.state || "",
    postalCode: companyLocation.postalCodeOverride || newLocation.postalCode || "",
    country: companyLocation.countryOverride || newLocation.country,
    description: newLocation.description || "",
    imageUrl:
      newLocation.imageUrl ||
      "https://placehold.co/600x400/E0E7FF/4338CA?text=No+Image",
    phone: newLocation.phone || "N/A",
    email: newLocation.email || "N/A",
    capacity: newLocation.capacity || 0,
    openHours: newLocation.openHours || "N/A",
    status: newLocation.status,
  };

  // Explicitly return success with status 201
  
    try { await cacheDel(`admin:locationsv2:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, formatted, null, 201);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(handleGetLocations);
export const POST = withApiHandler(handlePostLocation);
