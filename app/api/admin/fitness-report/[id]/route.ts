import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";



import prisma from '@/server/db/prismadb';

// New Imports
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// Type definition for the context object containing dynamic route parameters
type RouteContext = {
    params: {
        id: string; // The ID of the property
    };
};

// --- GET Handler Logic (Fetch a single property by ID) ---
const getPropertyLogic = async (request: Request, { params }: RouteContext) => {

    const { id } = params;

    const cacheKey = `admin:fitness-report:${id || 'global'}:all`;    

    try {
        const cached = await cacheGet(cacheKey);
        if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

  const property = await prisma.property.findUnique({
        where: { id },
        include: {
            category: true,
            location: true,
            agent: {
                select: { id: true, name: true, email: true }
            },
        },
    });

    if (!property) {
        // Return 404 response
        return formatResponse(false, null, 'Property not found', 404);
    }

    try {
        if (property) {
        await cacheSet(cacheKey, property, 60);
        }
    } catch (e) {}

    // Return 200 success response
    return formatResponse(true, property, 'Property retrieved successfully', 200);
};

// =======================================================================
// --- PUT Handler Logic (Updates an existing property) ---
// =======================================================================
const putPropertyLogic = async (request: Request, { params }: RouteContext) => {
    const { id } = params;
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
    } = body;

    try {
        const updatedProperty = await prisma.property.update({
            where: { id },
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
                photos,
                features,
            },
        });

        // Return 200 success response
        
    try { await cacheDel(`admin:fitness-report:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedProperty, 'Property updated successfully', 200);
    } catch (error: any) {
        if (error.code === 'P2025') { // Prisma error code for record not found
            return formatResponse(false, null, 'Property not found for update.', 404);
        }
        // Re-throw other errors for withApiHandler to catch as a 500
        throw error;
    }
};

// =======================================================================
// --- DELETE Handler Logic (Deletes a property) ---
// =======================================================================
const deletePropertyLogic = async (request: Request, { params }: RouteContext) => {
    const { id } = params;

    try {
        await prisma.property.delete({
            where: { id },
        });
        // Return 200 success response
        
    try { await cacheDel(`admin:fitness-report:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, 'Property deleted successfully', 200);
    } catch (error: any) {
        if (error.code === 'P2025') { // Prisma error code for record not found
            return formatResponse(false, null, 'Property not found for deletion.', 404);
        }
        // Re-throw other errors for withApiHandler to catch as a 500
        throw error;
    }
};


// Export the handlers wrapped with withApiHandler
// Authentication is handled automatically by withApiHandler
export const GET = withApiHandler(getPropertyLogic);
export const PUT = withApiHandler(putPropertyLogic);
export const DELETE = withApiHandler(deletePropertyLogic);
