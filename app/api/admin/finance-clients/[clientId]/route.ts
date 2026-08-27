import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/clients/[id]/route.ts
// Incorporate the new imports
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse'; 

import prisma from "@/server/db/prismadb";

// Helper to extract ID and ensure it's a string, as required by Prisma where clause
const getClientId = (req: Request, context: { params: { id: string } }) => {
    return context.params.id;
};

// --- GET Handler Logic ---
const getClientLogic = async (req: Request, context: { params: { id: string } }) => {
    
const clientId = getClientId(req, context);

const cacheKey = `admin:finance-clients:${clientId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
            user: true,
        },
    });

    if (!client) {
        // Use formatResponse for business-logic failure (404)
        return formatResponse(false, null, 'Client not found', 404);
    }

    try {
      await cacheSet(cacheKey, client, 60);
    } catch (e) {}

    // Use formatResponse for success
    return formatResponse(true, client, 'Client retrieved successfully', 200);
};

// Export the wrapped GET function
export const GET = withApiHandler(getClientLogic);


// --- PUT Handler Logic ---
const putClientLogic = async (req: Request, context: { params: { id: string } }) => {
    const clientId = getClientId(req, context);
    const body = await req.json();
    const { name, email, phone, status, ...clientData } = body;
    
    const cacheKey = `admin:finance-clients:${clientId || 'global'}:all`;

    const existingClient = await prisma.client.findUnique({
        where: { id: clientId },
    });

    if (!existingClient) {
        return formatResponse(false, null, 'Client not found', 404);
    }

    // Update the related User model fields
    await prisma.user.update({
        where: { id: existingClient.userId },
        data: {
            name,
            email,
            phone,
            status,
        },
    });

    // Update the Client-specific fields
    const updatedClient = await prisma.client.update({
        where: { id: clientId },
        data: clientData,
        include: {
            user: true,
        },
    });

    // Clear cache for this specific client
    try { await cacheDel(cacheKey); } catch (e) {}

    return formatResponse(true, updatedClient, 'Client updated successfully', 200);
};

// Export the wrapped PUT function
export const PUT = withApiHandler(putClientLogic);


// --- DELETE Handler Logic ---
const deleteClientLogic = async (req: Request, context: { params: { id: string } }) => {
    
    const clientId = getClientId(req, context);

    const cacheKey = `admin:finance-clients:${clientId || 'global'}:all`;

    const existingClient = await prisma.client.findUnique({
        where: { id: clientId },
    });

    if (!existingClient) {
        return formatResponse(false, null, 'Client not found', 404);
    }

    // Delete the Client and its associated User record
    await prisma.client.delete({
        where: { id: clientId },
    });
    await prisma.user.delete({
        where: { id: existingClient.userId },
    });

    // Clear cache for this specific client and any related lists
    try { await cacheDel(cacheKey); } catch (e) {}
    
    return formatResponse(true, null, 'Client and user deleted successfully', 200);
};

// Export the wrapped DELETE function
export const DELETE = withApiHandler(deleteClientLogic);