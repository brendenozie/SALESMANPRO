import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/properties/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/properties
// Fetches all properties, with optional filtering
export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);

  const categoryId = searchParams.get("categoryId");
  const locationId = searchParams.get("locationId");
  const agentId = searchParams.get("agentId");
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const searchTerm = searchParams.get("searchTerm");
  const companyId = searchParams.get("companyId");

  const where: any = {};

  if (categoryId) where.categoryId = categoryId;
  if (locationId) where.locationId = locationId;
  if (agentId) where.agentId = agentId;
  if (status) where.status = status;
  if (type) where.type = type;
  if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
  if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
  if (companyId) where.companyId = companyId;

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
      { address: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  const cacheKey = buildTenantCacheKey(companyId, "properties", { categoryId, status, type });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const properties = await prisma.property.findMany({
    where,
    include: {
      category: true,
      location: true,
      agent: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  try {
    if (properties) {
      await cacheSet(cacheKey, properties, 60);
    }
  } catch (e) {}

  return formatResponse(true, properties, "Properties fetched successfully");
});

// POST /api/properties
// Creates a new property
export const POST = withApiHandler(async (request: Request) => {
  const body = await request.json();

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
    companyId,
  } = body;

  if (!title || !price || !type || !status || !categoryId || !locationId || !companyId) {
    return formatResponse(false, null, "Missing required fields", 400);
  }

  const newProperty = await prisma.property.create({
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
      photos: photos || [],
      features: features || [],
      companyId,
    },
  });

  
    try {
      await cacheDel(`tenant:${newProperty.companyId}:properties:*`);
      await cacheDel(`admin:properties:*`);
    } catch (e) {}
    return formatResponse(true, newProperty, "Property created successfully", 201);
});
