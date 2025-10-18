

import prisma from '@/server/db/prismadb'; // Assuming this is your Prisma client instance
import bcrypt from 'bcryptjs';
// Incorporate the new utilities
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// Removed old imports:
// import { formatResponse } from "@/lib/formatResponse";


// Type definition for the context object
type RouteContext = {
    params: {
        adminSlug: string; // The dynamic part of the URL: /admin/[adminSlug]
    };
};

// --- GET Handler Logic (Fetch All Clients for a Company) ---
const getClientsLogic = async (req: Request, context: RouteContext) => {
    // 1. Get companyId from query string (as per original logic)
    
    const { searchParams } = new URL(req.url);
    
    const companyId = searchParams.get('companyId');

    if (!companyId) {
        return formatResponse(false, null, 'companyId query parameter is required.', 400);
    }

    // 2. Verify Company (ensuring the ID maps to an existing company)
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true },
    });

    if (!company) {
        return formatResponse(false, null, 'Company not found.', 404);
    }

    // 3. Fetch Clients
    const clients = await prisma.client.findMany({
        where: {
            companyId: company.id,
        },
        include: {
            user: { // Include the related User model to get name, email, phone
                select: { id: true, name: true, email: true, phone: true },
            },
        },
        orderBy: {
            joinDate: 'desc',
        },
    });

    // 4. Map Prisma Client model to a frontend-friendly interface
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

    // Use formatResponse for success
    return formatResponse(true, formattedClients, 'Clients retrieved successfully', 200);
};

// Export the wrapped GET function
export const GET = withApiHandler(getClientsLogic);


// --- POST Handler Logic (Create New Client) ---
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
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true },
                },
            },
        });
        return newClient;
    });

    // 7. Format the new client data for frontend display
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
};

// Export the wrapped POST function
export const POST = withApiHandler(postClientLogic);
