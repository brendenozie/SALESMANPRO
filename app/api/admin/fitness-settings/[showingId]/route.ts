import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";


import prisma from '@/server/db/prismadb'; // Adjust this path
// New Imports
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// Define the type for the dynamic route context
type RouteContext = {
    params: {
        id: string; // The ID of the FAQ item
    };
};

// =======================================================================
// --- GET Handler Logic (Fetch a single FAQ by ID) ---
// =======================================================================
const getFaqLogic = async (request: Request, { params }: RouteContext) => {
    const { id } = params;

    const cacheKey = `admin:fitness-settings:${id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const faq = await prisma.fAQ.findUnique({
        where: { id },
    });

    if (!faq) {
        // Use formatResponse for 404
        return formatResponse(false, null, 'FAQ not found', 404);
    }

    try {
        if (faq) {
        await cacheSet(cacheKey, faq, 60);
        }
    } catch (e) {}

    // Return 200 success response
    return formatResponse(true, faq, 'FAQ fetched successfully', 200);
};

// =======================================================================
// --- PUT Handler Logic (Updates an existing FAQ) ---
// =======================================================================
const putFaqLogic = async (request: Request, { params }: RouteContext) => {
    const { id } = params;
    const { question, answer } = await request.json();

    try {
        const updatedFaq = await prisma.fAQ.update({
            where: { id },
            data: { question, answer },
        });

        // Return 200 success response
        
    try { await cacheDel(`admin:fitness-settings:${id || 'global'}:*`); } catch (e) {}

    return formatResponse(true, updatedFaq, 'FAQ updated successfully', 200);

    } catch (error: any) {
        if (error.code === 'P2025') { // Prisma error code for record not found
            return formatResponse(false, null, 'FAQ not found for update.', 404);
        }
        // Re-throw other errors for withApiHandler to catch as a 500
        throw error;
    }
};

// =======================================================================
// --- DELETE Handler Logic (Deletes an FAQ) ---
// =======================================================================
const deleteFaqLogic = async (request: Request, { params }: RouteContext) => {
    const { id } = params;

    try {
        await prisma.fAQ.delete({
            where: { id },
        });

        // Return 200 success response
        
    try { await cacheDel(`admin:fitness-settings:${id || 'global'}:*`); } catch (e) {}
    
    return formatResponse(true, null, 'FAQ deleted successfully', 200);
    } catch (error: any) {
        if (error.code === 'P2025') { // Prisma error code for record not found
            return formatResponse(false, null, 'FAQ not found for deletion.', 404);
        }
        // Re-throw other errors for withApiHandler to catch as a 500
        throw error;
    }
};


// Export the handlers wrapped with withApiHandler
// Authentication and generic error handling are now centralized.
export const GET = withApiHandler(getFaqLogic);
export const PUT = withApiHandler(putFaqLogic);
export const DELETE = withApiHandler(deleteFaqLogic);
