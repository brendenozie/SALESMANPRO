import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import bcrypt from 'bcryptjs';
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// Define the ROLE enum if not already globally available
enum ROLE {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT', // Ensure CLIENT role exists
  // ... other roles
}

// Mock authentication/authorization for demonstration
const authorizeAdmin = async (req: Request) => {
  // This is a placeholder. Implement real authentication/authorization here.
  // const userId = getUserIdFromSession(req);
  // const user = await prisma.user.findUnique({ where: { id: userId } });
  // if (!user || user.role !== ROLE.ADMIN) {
  //   return { authorized: false, status: 403, message: 'Forbidden: Admin access required' };
  // }
  return { authorized: true, status:200, message:'authorized' };
};

// --- GET: Fetch all clients ---
export async function GET(req: Request) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');


  try {
    // Fetch all Client records and include their associated User data
    const clients = await prisma.client.findMany({
      where: companyId ? { companyId } : {},
      include: {
        user: true, // This will fetch the related User model data
      },
      orderBy: {
        createdAt: 'desc', // Order by creation date, newest first
      },
    });

    // Map the Prisma results to the frontend's ClientProfile type
    const clientProfiles = clients.map(c => ({
      id: c.id,
      name: c.user.name || '',
      email: c.user.email,
      phone: c.user.phone || '',
      // Ensure these fields exist in your Prisma Client model for full functionality
      inquiryCount: c.inquiryCount || 0,
      dealStatus: (c.dealStatus as 'Lead' | 'Active' | 'Closed' | 'Archived') || 'Lead', // Default if null
      lastActivity: c.lastActivity?.toISOString() || c.createdAt?.toISOString() || new Date().toISOString(),
      notes: c.notes || '',
      preferredPropertyTypes: c.preferredPropertyTypes || [],
      budgetRange: c.budgetRange || '',
    }));

    return NextResponse.json(clientProfiles, { status: 200 });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// --- POST: Create a new client ---
export async function POST(req: Request) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  try {
    const {
      name,
      email,
      password, // Optional, but good for initial setup
      phone,
      bio, // From User model
      companyId, // Required for Client model
      salesAgentId, // Optional: if assigning to an agent during creation
      inquiryCount = 0,
      dealStatus = 'Lead', // Default to 'Lead'
      lastActivity = new Date().toISOString(),
      notes = '',
      preferredPropertyTypes = [],
      budgetRange = '',
    } = await req.json();

    // 1. Basic Input Validation
    if (!name || !email || !companyId) {
      return NextResponse.json({ message: 'Missing required fields: name, email, companyId' }, { status: 400 });
    }

    // 2. Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }

    // 3. Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 4. Create User record
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: ROLE.CLIENT, // Assign CLIENT role
        phone,
        bio,
        emailVerified: new Date(), // Mark as verified for simplicity
      },
    });

    // 5. Create Client record, linking to the new User
    const newClient = await prisma.client.create({
      data: {
        userId: newUser.id,
        companyId,
        salesAgentId: salesAgentId || undefined, // Link to sales agent if provided
        inquiryCount,
        dealStatus,
        lastActivity: new Date(lastActivity),
        notes,
        preferredPropertyTypes,
        budgetRange,
      },
      include: {
        user: true, // Include user data for the response
      },
    });

    // Map the new client data to the frontend's ClientProfile type
    const clientProfile = {
      id: newClient.id,
      name: newUser.name || '',
      email: newUser.email,
      phone: newUser.phone || '',
      inquiryCount: newClient.inquiryCount || 0,
      dealStatus: (newClient.dealStatus as 'Lead' | 'Active' | 'Closed' | 'Archived') || 'Lead',
      lastActivity: newClient.lastActivity?.toISOString() || newClient.createdAt?.toISOString() || new Date().toISOString(),
      notes: newClient.notes || '',
      preferredPropertyTypes: newClient.preferredPropertyTypes || [],
      budgetRange: newClient.budgetRange || '',
    };

    return NextResponse.json({ message: 'Client created successfully', client: clientProfile }, { status: 201 });

  } catch (error) {
    console.error('Error creating client:', error);
    // if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
    //   return NextResponse.json({ message: 'Email already in use by another user.' }, { status: 409 });
    // }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
