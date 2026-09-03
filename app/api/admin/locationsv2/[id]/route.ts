import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { Prisma } from '@prisma/client';

// Define the expected structure for route parameters
type RouteParams = { params: { adminSlug: string, locationId: string } };

// A utility function to ensure slugs are correctly formatted (kept local for self-containment)
const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// --- PUT Handler Core Logic ---

async function handlePutLocation(request: Request, { params }: RouteParams) {
  const { adminSlug, locationId } = params;
  const body = await request.json();

  const {
    name,
    address,
    city,
    state,
    zipCode,
    country,
    description,
    imageUrl,
    phone,
    email,
    capacity,
    openHours,
    status,
  } = body;

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found.', 404);
  }

  const existingLocation = await prisma.location.findUnique({
    where: { id: locationId },
    select: { companyId: true, slug: true, name: true },
  });

  if (!existingLocation || existingLocation.companyId !== company.id) {
    return formatResponse(false, null, 'Location not found or does not belong to this company.', 404);
  }

  let updatedSlug = existingLocation.slug;
  // If name is changed, regenerate slug and check for uniqueness
  if (name && name !== existingLocation.name) {
    const newGeneratedSlug = slugify(name);
    if (newGeneratedSlug !== existingLocation.slug) {
      let uniqueSlug = newGeneratedSlug;
      let suffix = 1;
      // Check for slug conflicts globally (assuming Location slug is globally unique)
      while (await prisma.location.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${newGeneratedSlug}-${suffix}`;
        suffix++;
      }
      updatedSlug = uniqueSlug;
    }
  }

  try {
    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: {
        name: name,
        slug: updatedSlug, // Use the updated/re-generated slug
        address: address,
        city: city,
        state: state || null,
        zipCode: zipCode || null,
        country: country,
        description: description || null,
        imageUrl: imageUrl || null,
        phone: phone || null,
        email: email || null,
        capacity: capacity ? parseInt(capacity) : null,
        openHours: openHours || null,
        status: status,
        // updatedBy field would ideally be set here using the authenticated user ID
      },
    });

    // Format the updated location data for frontend display
    const formattedUpdatedLocation = {
      id: updatedLocation.id,
      name: updatedLocation.name,
      slug: updatedLocation.slug,
      address: updatedLocation.address,
      city: updatedLocation.city,
      state: updatedLocation.state || '',
      zipCode: updatedLocation.zipCode || '',
      country: updatedLocation.country,
      description: updatedLocation.description || '',
      imageUrl: updatedLocation.imageUrl || 'https://placehold.co/600x400/E0E7FF/4338CA?text=No+Image',
      phone: updatedLocation.phone || 'N/A',
      email: updatedLocation.email || 'N/A',
      capacity: updatedLocation.capacity || 0,
      openHours: updatedLocation.openHours || 'N/A',
      status: updatedLocation.status,
    };

    // withApiHandler will wrap this in formatResponse(true, formattedUpdatedLocation, null, 200)
    
    try {
      await cacheDel(`tenant:${locationId}:locationsv2:*`);
      await cacheDel(`admin:locationsv2:*`);
    } catch (e) {}
    return formatResponse(true, formattedUpdatedLocation, "Location updated successfully", 200);

  } catch (error) {
    // Catch specific Prisma errors before generic catch by withApiHandler
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') { // Unique constraint violation (e.g., slug conflict if it wasn't caught above)
        return formatResponse(false, null, 'A location with this slug already exists.', 409);
      }
    }
    // Re-throw other errors to be handled by withApiHandler
    throw error;
  }
}

// --- DELETE Handler Core Logic ---

async function handleDeleteLocation(request: Request, { params }: RouteParams) {
  const { adminSlug, locationId } = params;

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found.', 404);
  }

  const locationToDelete = await prisma.location.findUnique({
    where: { id: locationId },
    select: { companyId: true },
  });

  if (!locationToDelete || locationToDelete.companyId !== company.id) {
    return formatResponse(false, null, 'Location not found or does not belong to this company.', 404);
  }

  try {
    await prisma.location.delete({
      where: { id: locationId },
    });

    // Return success response with status 200
    
    try {
      await cacheDel(`tenant:${locationId}:locationsv2:*`);
      await cacheDel(`admin:locationsv2:*`);
    } catch (e) {}
    return formatResponse(true, null, 'Location deleted successfully.', 200);

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, 'Location not found.', 404);
    }
    // Re-throw other errors (e.g., Foreign Key Constraint failure)
    throw error;
  }
}

// Export the wrapped handlers
export const PUT = withApiHandler(handlePutLocation);
export const DELETE = withApiHandler(handleDeleteLocation);
