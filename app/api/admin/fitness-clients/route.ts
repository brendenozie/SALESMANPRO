

import prisma from '@/server/db/prismadb';
import bcrypt from 'bcryptjs';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { cacheGet, cacheSet, cacheDel } from '@/lib/cache';

// ============================================================================
// CONSTANTS & OPTIMIZATIONS
// ============================================================================

/**
 * Type definition for formatted client response
 */
interface FormattedClient {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    membershipType: string;
    membershipStatus: string;
    joinDate: string;
    lastActive: string;
    photoUrl: string;
}

/**
 * OPTIMIZATION: Constant selection object for database queries.
 * Uses `select` instead of `include` to fetch only required fields.
 */
const CLIENT_SELECT = {
    id: true,
    userId: true,
    membershipType: true,
    membershipStatus: true,
    joinDate: true,
    lastActive: true,
    photoUrl: true,
    user: {
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
        },
    },
};

// Type definition for the context object
type RouteContext = {
    params: {
        adminSlug: string; // The dynamic part of the URL: /admin/[adminSlug]
    };
};

// ============================================================================
// GET HANDLER - Cache-First Pattern with Edge Caching
// ============================================================================

/**
 * GET /api/admin/fitness-clients
 * 
 * OPTIMIZATIONS:
 * 1. Cache-First: Checks Redis before hitting the database
 * 2. Selective Fields: Uses `select` to fetch only required fields
 * 3. Flat Response: Returns flattened data structure
 * 4. Edge Caching: Includes Cache-Control headers
 */
const getClientsLogic = async (req: Request, context: RouteContext) => {
    // 1. Get companyId from query string (as per original logic)
    
    const { searchParams } = new URL(req.url);
    
    const companyId = searchParams.get('companyId');

    if (!companyId) {
        return formatResponse(false, null, 'companyId query parameter is required.', 400);
    }

    // Cache key with companyId for proper scoping
    const CACHE_KEY = `admin:fitness-clients:${companyId}`;
    const CACHE_TTL = 60; // 60 seconds

    try {
        // STEP 1: Check cache first (Cache-First Pattern)
        const cachedClients = await cacheGet<FormattedClient[]>(CACHE_KEY);
        
        if (cachedClients) {
            // Cache hit - return cached data with edge caching headers
            const response = formatResponse(true, cachedClients, 'Clients retrieved successfully', 200);
            response.headers.set(
                'Cache-Control',
                's-maxage=60, stale-while-revalidate=30'
            );
            return response;
        }

        // 2. Verify Company (ensuring the ID maps to an existing company)
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true },
        });

        if (!company) {
            return formatResponse(false, null, 'Company not found.', 404);
        }

        // STEP 2: Cache miss - query database with optimized select
        const clients = await prisma.client.findMany({
            where: {
                companyId: company.id,
            },
            select: CLIENT_SELECT,
            orderBy: {
                joinDate: 'desc',
            },
        });

        // STEP 3: Map Prisma Client model to a frontend-friendly interface
        const formattedClients = clients.map(client => ({
            id: client.id,
            userId: client.userId,
            name: client.user?.name || 'N/A',
            email: client.user?.email || 'N/A',
            phone: client.user?.phone || 'N/A',
            membershipType: client.membershipType || 'Standard',
            membershipStatus: client.membershipStatus,
            joinDate: client.joinDate?.toISOString().split('T')[0], // YYYY-MM-DD
            lastActive: client.lastActive?.toISOString().split('T')[0], // YYYY-MM-DD
            photoUrl: client.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
        }));

        // STEP 4: Update cache for future requests
        await cacheSet(CACHE_KEY, formattedClients, CACHE_TTL);

        // STEP 5: Return response with edge caching headers
        const response = formatResponse(true, formattedClients, 'Clients retrieved successfully', 200);
        response.headers.set(
            'Cache-Control',
            's-maxage=60, stale-while-revalidate=30'
        );
        
        return response;
    } catch (error: any) {
        console.error('Error fetching fitness clients:', error);
        return formatResponse(false, null, 'Failed to fetch clients', 500);
    }
};

// Export the wrapped GET function
export const GET = withApiHandler(getClientsLogic);

// ============================================================================
// POST HANDLER - Atomic Operations with Cache Invalidation
// ============================================================================

/**
 * POST /api/admin/fitness-clients
 * 
 * OPTIMIZATIONS:
 * 1. Input Validation: Validates all required fields upfront
 * 2. Atomic Operations: Uses Prisma transaction for creating User and Client
 * 3. Selective Return: Returns only required fields using select
 * 4. Cache Invalidation: Invalidates all admin:fitness-clients:* cache keys
 * 5. Flat Response: Returns flattened data structure
 */
const postClientLogic = async (req: Request, context: RouteContext) => {
    const body = await req.json();
    const {
        name,
        email,
        password,
        phone,
        membershipType,
        membershipStatus,
        photoUrl,
    } = body;
    
    // 1. Get companyId from query string (as per original logic)
    
    const { searchParams } = new URL(req.url);
    
    const companyId = searchParams.get('companyId');

    if (!companyId) {
        return formatResponse(false, null, 'companyId query parameter is required.', 400);
    }

    try {
        // 2. Verify Company
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true },
        });

        if (!company) {
            return formatResponse(false, null, 'Company not found.', 404);
        }

        // 3. Basic validation
        if (!name || !email || !password || !membershipType || !membershipStatus) {
            return formatResponse(false, null, 'Name, email, password, membership type, and status are required.', 400);
        }
        if (password.length < 8) {
            return formatResponse(false, null, 'Password must be at least 8 characters long.', 400);
        }

        // 4. Check for existing user (P2002 Unique Constraint violation check)
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
        });
        if (existingUser) {
            return formatResponse(false, null, 'A user with this email already exists.', 409);
        }

        // 5. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 6. Use a Prisma transaction to ensure atomicity for creating User and Client
        const newClientData = await prisma.$transaction(async (tx) => {
            // Create the new User with CLIENT role
            const newUser = await tx.user.create({
                data: {
                    name: name,
                    email: email,
                    password: hashedPassword,
                    phone: phone || null,
                    role: 'CLIENT', // Assign the CLIENT role
                    status: 'ACTIVE', // Default status for new users
                    company: { connect: { id: companyId } },
                },
            });

            // Create the Client profile linked to the new User
            const newClient = await tx.client.create({
                data: {
                    userId: newUser.id,
                    companyId: companyId,
                    membershipType: membershipType,
                    membershipStatus: membershipStatus,
                    photoUrl: photoUrl || null,
                    joinDate: new Date(),
                    lastActive: new Date(),
                },
                select: CLIENT_SELECT,
            });
            return newClient;
        });

        // 7. Cache invalidation - invalidate all admin fitness-clients cache
        await cacheDel('admin:fitness-clients:*');

        // 8. Format the new client data for frontend display
        const formattedNewClient = {
            id: newClientData.id,
            userId: newClientData.userId,
            name: newClientData.user?.name || 'N/A',
            email: newClientData.user?.email || 'N/A',
            phone: newClientData.user?.phone || 'N/A',
            membershipType: newClientData.membershipType || 'Standard',
            membershipStatus: newClientData.membershipStatus,
            joinDate: newClientData.joinDate?.toISOString().split('T')[0],
            lastActive: newClientData.lastActive?.toISOString().split('T')[0],
            photoUrl: newClientData.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
        };

        // Use formatResponse for success
        return formatResponse(true, formattedNewClient, 'Client created successfully', 201);
    } catch (error: any) {
        console.error('Error creating fitness client:', error);
        
        // Enhanced error handling for specific Prisma errors
        if (error.code === 'P2002') {
            return formatResponse(
                false,
                null,
                'A user with this email already exists',
                409
            );
        }
        
        return formatResponse(false, null, 'Failed to create client', 500);
    }
};

// Export the wrapped POST function
export const POST = withApiHandler(postClientLogic);
