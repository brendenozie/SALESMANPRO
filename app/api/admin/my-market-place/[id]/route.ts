import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler, HandlerContext } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { enforceMarketplaceAccess } from "@/lib/subscriptions/enforce-limits";

// Helper to safely resolve route param in Next.js 15
async function resolveParamId(context: HandlerContext): Promise<string | null> {
  const params = await context.params;
  return params?.id || null;
}

// GET /api/admin/my-market-place/[id]
async function handleGetListing(req: Request, context: HandlerContext) {
  const id = await resolveParamId(context);
  if (!id) {
    return formatResponse(false, null, "Listing ID is required", 400);
  }

  const listing = await prisma.marketplaceListings.findUnique({
    where: { id },
    include: {
      productCategory: true,
      myLocation: true,
      propertyType: true,
    },
  });

  if (!listing) {
    return formatResponse(false, null, "Listing not found", 404);
  }

  return formatResponse(true, listing, "Listing fetched successfully", 200);
}

// PATCH/PUT /api/admin/my-market-place/[id]
async function handleUpdateListing(req: Request, context: HandlerContext) {
  const id = await resolveParamId(context);
  if (!id) {
    return formatResponse(false, null, "Listing ID is required", 400);
  }

  const existing = await prisma.marketplaceListings.findUnique({ where: { id } });
  if (!existing) {
    return formatResponse(false, null, "Listing not found", 404);
  }

  // --- Subscription Plan Enforcement: Marketplace Access Gate ---
  if (existing.companyId) {
    const marketCheck = await enforceMarketplaceAccess(existing.companyId);
    if (!marketCheck.allowed) {
      return formatResponse(false, { upgradeRequired: marketCheck.upgradeRequired }, marketCheck.message, 403);
    }
  }

  const body = await req.json();

  // Allow updating relevant fields safely
  const updateData: any = {};
  const allowedFields = [
    "name", "description", "longDescription", "sellingPrice", "buyingPrice",
    "finalPrice", "discount", "tax", "shippingCost", "isAvailable", "status",
    "area", "bathrooms", "bedrooms", "studios", "amenities", "images", "videos",
    "category", "subCategory", "subCategoryName", "tags", "brand", "model",
    "color", "size", "weight", "condition", "dimensions", "material",
    "duration", "isOnOffer", "isFlashDeal", "isNewArrival", "isDiscounted", "isFeatured",
    "locationName", "latitude", "longitude", "locationId", "propertyTypeId",
    "contact", "email", "contactName", "bookingSlots", "hourlyRate", "minimumHours"
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  const updatedListing = await prisma.marketplaceListings.update({
    where: { id },
    data: updateData,
    include: {
      productCategory: true,
      myLocation: true,
      propertyType: true,
    }
  });

  // Invalidate relevant cache keys
  try {
    if (existing.companyId) {
      await cacheDel(`admin:my-market-place:${existing.companyId}:*`);
      await cacheDel(`property:detail:${id}`);
      await cacheDel(`property:availability:${id}`);
    }
  } catch (e) {
    console.error("Cache invalidation error:", e);
  }

  return formatResponse(true, updatedListing, "Listing updated successfully", 200);
}

// DELETE /api/admin/my-market-place/[id]
async function handleDeleteListing(req: Request, context: HandlerContext) {
  const id = await resolveParamId(context);
  if (!id) {
    return formatResponse(false, null, "Listing ID is required", 400);
  }

  const existing = await prisma.marketplaceListings.findUnique({ where: { id } });
  if (!existing) {
    return formatResponse(false, null, "Listing not found", 404);
  }

  // --- Subscription Plan Enforcement: Marketplace Access Gate ---
  if (existing.companyId) {
    const marketCheck = await enforceMarketplaceAccess(existing.companyId);
    if (!marketCheck.allowed) {
      return formatResponse(false, { upgradeRequired: marketCheck.upgradeRequired }, marketCheck.message, 403);
    }
  }

  // Invariant Guard: Check if property has active bookings or active resident allocations
  const activeBookings = await prisma.booking.count({
    where: {
      propertyId: id,
      status: { in: ["CONFIRMED", "PENDING", "ACTIVE"] }
    }
  });

  const activeAllocations = await prisma.hostelAllocation.count({
    where: {
      propertyId: id,
      status: "ACTIVE"
    }
  });

  if (activeBookings > 0 || activeAllocations > 0) {
    // Graceful Archive Invariant: Do not hard delete active inventory
    const archived = await prisma.marketplaceListings.update({
      where: { id },
      data: {
        status: "INACTIVE",
        isAvailable: false
      }
    });

    try {
      if (existing.companyId) {
        await cacheDel(`admin:my-market-place:${existing.companyId}:*`);
      }
    } catch (e) {}

    return formatResponse(
      true,
      archived,
      "Listing has active bookings or resident allocations. It has been archived and marked unavailable instead of permanently deleted.",
      200
    );
  }

  // Hard delete if safe
  await prisma.marketplaceListings.delete({
    where: { id }
  });

  try {
    if (existing.companyId) {
      await cacheDel(`admin:my-market-place:${existing.companyId}:*`);
    }
  } catch (e) {}

  return formatResponse(true, null, "Listing permanently removed", 200);
}

export const GET = withApiHandler(handleGetListing);
export const PATCH = withApiHandler(handleUpdateListing);
export const PUT = withApiHandler(handleUpdateListing);
export const DELETE = withApiHandler(handleDeleteListing);
