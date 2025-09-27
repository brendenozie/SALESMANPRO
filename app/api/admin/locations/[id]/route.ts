import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Prisma } from "@prisma/client"; // For catching Prisma-specific errors

// Define the expected structure for route parameters
type RouteParams = { params: { id: string } };

// --- GET Handler ---
/**
 * Retrieves a single Location record by its ID.
 */
async function handleGetLocation(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!location) {
    // Return explicit failure response for 404
    return formatResponse(false, null, 'Location not found.', 404);
  }

  // withApiHandler wraps this successful result in formatResponse(true, location) with status 200
  return location;
}

// --- PATCH Handler ---
/**
 * Updates one or more fields of an existing Location record.
 * This is meant for partial updates.
 */
async function handlePatchLocation(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const body = await request.json();

  // Basic validation to prevent changing key identifiers via PATCH
  if (body.id) {
    return formatResponse(false, null, 'Cannot update ID via PATCH.', 400);
  }

  // NOTE: If slug is updated, a uniqueness check should occur here before the update.
  // For simplicity, we trust Prisma to handle unique constraint errors which the middleware will catch.

  try {
    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        ...body,
        // In a real app, updatedBy should come from the authenticated user context provided by withApiHandler
        updatedAt: new Date(),
      },
    });
    return updatedLocation;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, 'Location not found for update.', 404);
    }
    throw error; // Let withApiHandler catch other errors (like unique constraint violation)
  }
}

// --- PUT Handler ---
/**
 * Fully replaces/updates an existing Location record.
 * This is meant for full updates and includes robust checks.
 */
async function handlePutLocation(request: NextRequest, { params }: RouteParams) {
  const { id: locationId } = params;
  const body = await request.json();

  const {
    name,
    slug,
    description,
    addressLine1,
    city,
    state,
    postalCode,
    country,
    latitude,
    longitude,
    sortOrder,
    visible,
    parentId,
    // Assuming these fields exist in the database model
    addressLine2,
    seoTitle,
    seoDescription,
    metaKeywords,
    localization,
    attributes,
    status,
  } = body;

  const existingLocation = await prisma.location.findUnique({ where: { id: locationId } });
  if (!existingLocation) {
    return formatResponse(false, null, "Location not found", 404);
  }

  // Ensure slug uniqueness if changing
  if (slug && slug !== existingLocation.slug) {
    const slugConflict = await prisma.location.findUnique({ where: { slug } });
    if (slugConflict) {
      return formatResponse(false, null, "Location with this slug already exists", 409);
    }
  }

  const updatedLocation = await prisma.location.update({
    where: { id: locationId },
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
      metaKeywords: metaKeywords || [], // Assuming array field
      sortOrder,
      visible,
      parentId: parentId === '' ? null : parentId,
      localization: localization || null,
      attributes: attributes || null,
      status,
      // updatedBy would ideally come from the user session passed via withApiHandler context
      updatedAt: new Date(),
    },
  });

  return updatedLocation;
}

// --- DELETE Handler ---
/**
 * Deletes a Location record after checking for dependencies (children and associations).
 */
async function handleDeleteLocation(request: NextRequest, { params }: RouteParams) {
  const { id: locationId } = params;

  // 1. Verify location exists and check for children
  const existingLocation = await prisma.location.findUnique({
    where: { id: locationId },
    include: { children: true }
  });

  if (!existingLocation) {
    return formatResponse(false, null, "Location not found", 404);
  }

  // 2. Prevent deletion if it has children
  if (existingLocation.children && existingLocation.children.length > 0) {
    return formatResponse(false, null, "Cannot delete location with active child locations. Please reassign or delete children first.", 400);
  }

  // 3. Check for external references (CompanyLocation)
  const companyLocationRefs = await prisma.companyLocation.count({
    where: { locationId: locationId }
  });
  if (companyLocationRefs > 0) {
    return formatResponse(false, null, "Cannot delete location as it is associated with one or more stores. Please remove associations first.", 409);
  }

  // 4. Perform deletion
  await prisma.location.delete({
    where: { id: locationId },
  });

  // Return success response with 204 No Content (standard for DELETE)
  return formatResponse(true, null, "Location deleted successfully", 204);
}

// --- Export Handlers Wrapped in Middleware ---
export const GET = withApiHandler(handleGetLocation);
export const PATCH = withApiHandler(handlePatchLocation);
export const PUT = withApiHandler(handlePutLocation);
export const DELETE = withApiHandler(handleDeleteLocation);
