import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";


import prisma from '@/server/db/prismadb'; // Assuming this is your Prisma client instance
// Incorporate the new utilities
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse'; 

// Type definition for the context object
type RouteContext = {
    params: {
        adminSlug: string; // The dynamic part of the URL: /admin/[adminSlug]
        clientId: string;  // The dynamic part of the URL: /clients/[clientId]
    };
};

// Helper to access dynamic parameters
const getParams = (context: RouteContext) => context.params;

// --- PUT Handler Logic (Update Client) ---
const putClientLogic = async (request: Request, context: RouteContext) => {
    const { adminSlug, clientId } = getParams(context);

    const body = await request.json();
    const {
        name,
        email,
        phone,
        membershipType,
        membershipStatus,
        photoUrl,
    } = body;

    // 1. Verify company and client existence
    const company = await prisma.company.findUnique({
        where: { slug: adminSlug },
        select: { id: true },
    });

    if (!company) {
        return formatResponse(false, null, 'Company not found.', 404);
    }

    const existingClient = await prisma.client.findUnique({
        where: { id: clientId },
        include: { user: true },
    });

    if (!existingClient || existingClient.companyId !== company.id) {
        return formatResponse(false, null, 'Client not found or does not belong to this company.', 404);
    }

    // 2. Use a Prisma transaction for atomicity (updating both User and Client)
    const updatedClientData = await prisma.$transaction(async (tx) => {
        // Update the associated User record
        await tx.user.update({
            where: { id: existingClient.userId },
            data: {
                name: name,
                email: email,
                phone: phone || null,
            },
        });

        // Update the Client profile
        const updatedClient = await tx.client.update({
            where: { id: clientId },
            data: {
                membershipType: membershipType,
                membershipStatus: membershipStatus,
                photoUrl: photoUrl || null,
                lastActive: new Date(),
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true },
                },
            },
        });
        return updatedClient;
    });

    // 3. Format the updated client data for frontend display
    const formattedUpdatedClient = {
        id: updatedClientData.id,
        userId: updatedClientData.userId,
        name: updatedClientData.user?.name || 'N/A',
        email: updatedClientData.user?.email || 'N/A',
        phone: updatedClientData.user?.phone || 'N/A',
        membershipType: updatedClientData.membershipType || 'Standard',
        membershipStatus: updatedClientData.membershipStatus,
        joinDate: updatedClientData.joinDate?.toISOString().split('T')[0],
        lastActive: updatedClientData.lastActive?.toISOString().split('T')[0],
        photoUrl: updatedClientData.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
    };

    try {
        await cacheSet(`admin:fitness-clients:${company.id || 'global'}:all`, formattedUpdatedClient, 60);
    } catch (e) {}

    // Use formatResponse for success
    return formatResponse(true, formattedUpdatedClient, 'Client updated successfully', 200);
};

// Export the wrapped PUT function
// NOTE: P2002 (Unique Constraint Violation) and P2025 (Record Not Found) errors
// that occur within the logic will be automatically caught and handled by withApiHandler.
export const PUT = withApiHandler(putClientLogic);


// --- DELETE Handler Logic (Delete Client) ---
const deleteClientLogic = async (request: Request, context: RouteContext) => {
    const { adminSlug, clientId } = getParams(context);

    // 1. Verify company
    const company = await prisma.company.findUnique({
        where: { slug: adminSlug },
        select: { id: true },
    });

    if (!company) {
        return formatResponse(false, null, 'Company not found.', 404);
    }

    // 2. Verify Client existence and ownership
    const clientToDelete = await prisma.client.findUnique({
        where: { id: clientId },
        select: { companyId: true, userId: true },
    });

    if (!clientToDelete || clientToDelete.companyId !== company.id) {
        return formatResponse(false, null, 'Client not found or does not belong to this company.', 404);
    }

    // 3. Delete the Client profile. (Assuming CASCADE delete handles the User record)
    await prisma.client.delete({
        where: { id: clientId },
    });

    // Use formatResponse for success
    
    try {
      await cacheDel(`tenant:${company.id}:fitness-clients:*`);
      await cacheDel(`admin:fitness-clients:*`);
    } catch (e) {}
    return formatResponse(true, null, 'Client deleted successfully.', 200);
};

// Export the wrapped DELETE function
export const DELETE = withApiHandler(deleteClientLogic);
