import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from "@/server/db/prismadb"; // Make sure this path is correct
// New Imports
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// Type definition for the context object containing dynamic route parameters
type RouteContext = {
    params: {
        id: string; // The ID of the tour package
    };
};

// A robust slugify function to create a URL-friendly string from a name.
const slugify = (text: string) => {
    return text
        .toString()
        .normalize('NFD') // Normalize characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')  // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-');  // Replace multiple - with single -
};

// --- GET Handler Logic (Fetch a single tour package) ---
const getTourPackageLogic = async (request: Request, { params }: RouteContext) => {
    const { id } = params;

    
    const cacheKey = `admin:fitness-programs:${'global' || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const tourPackage = await prisma.tourPackage.findUnique({
        where: { id },
        include: {
            destinations: {
                select: { id: true, name: true }, // Adjust fields as necessary
            },
        },
    });

  try {
    if (tourPackage) {
      await cacheSet(cacheKey, tourPackage, 60);
    }
  } catch (e) {}

    if (!tourPackage) {
        // Return 404 response using formatResponse utility
        return formatResponse(false, null, 'Tour package not found', 404);
    }

    // Transform data to match a flattened format, if needed by the frontend.
    const transformedPackage = {
        ...tourPackage,
        // Assuming destination is a single object here based on original include structure
        destinationName: tourPackage.destinations.map(dest => {
            return { id: dest.id, name: dest.name };
        }),

    };

    // Return 200 success response using formatResponse utility
    return formatResponse(true, transformedPackage, 'Tour package retrieved successfully', 200);
};

// =======================================================================
// --- PUT Handler Logic (Updates an existing tour package) ---
// =======================================================================
const putTourPackageLogic = async (request: Request, { params }: RouteContext) => {
    const { id } = params; // Get ID directly from context.params

    const body = await request.json();
    const {
        name,
        description,
        longDescription,
        duration,
        price,
        status,
        imageUrl,
        images,
        destinationIds, // Array of IDs to associate
    } = body;

    const updatedTourPackage = await prisma.$transaction(async (tx) => {
        // 1. First, unlink all destinations currently associated with this package.
        await tx.destination.updateMany({
            where: { tourPackageId: id },
            data: { tourPackageId: null },
        });

        // 2. Then, link the new set of destinations.
        if (destinationIds && destinationIds.length > 0) {
            await tx.destination.updateMany({
                where: { id: { in: destinationIds } },
                data: { tourPackageId: id },
            });
        }

        // 3. Update the tour package itself with the new data.
        const updatedPackage = await tx.tourPackage.update({
            where: { id },
            data: {
                name,
                slug: slugify(name),
                description,
                longDescription,
                duration,
                price: parseFloat(price),
                status,
                imageUrl,
                images: images || [],
            },
        });

        return updatedPackage;
    });

    // Return 200 success response using formatResponse utility
    return formatResponse(true, updatedTourPackage, 'Tour package updated successfully', 200);
};

// =======================================================================
// --- DELETE Handler Logic (Deletes a tour package) ---
// =======================================================================
const deleteTourPackageLogic = async (request: Request, { params }: RouteContext) => {
    const { id } = params; // Get ID directly from context.params

    await prisma.$transaction(async (tx) => {
        // 1. Unlink all destinations first.
        await tx.destination.updateMany({
            where: { tourPackageId: id },
            data: { tourPackageId: null },
        });

        // 2. Delete the tour package itself.
        await tx.tourPackage.delete({
            where: { id },
        });
    });

    // Return 200 success response using formatResponse utility
    return formatResponse(true, null, 'Tour package deleted successfully', 200);
};

// Export the handlers wrapped with withApiHandler
export const GET = withApiHandler(getTourPackageLogic);
export const PUT = withApiHandler(putTourPackageLogic);
export const DELETE = withApiHandler(deleteTourPackageLogic);
