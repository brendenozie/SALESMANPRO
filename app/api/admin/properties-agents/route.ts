import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import bcrypt from 'bcryptjs';
import { AgentProfile } from "@/app/admin/[slug]/agents/AgentsClient";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { request } from "http";

// Define the ROLE enum if not already globally available
enum ROLE {
  ADMIN = 'ADMIN',
  SALES_AGENT = 'AGENT',
}

// Mock authentication/authorization for demonstration
// In a real app, you'd get this from session, JWT, etc.
const authorizeAdmin = async (req: Request) => {
  // This is a placeholder. Implement real authentication/authorization here.
  // Example: Check for a valid session token, decode JWT, check user role.
  // For this example, we'll assume a hardcoded admin check or always allow for simplicity.
  // const userId = getUserIdFromSession(req);
  // const user = await prisma.user.findUnique({ where: { id: userId } });
  // if (!user || user.role !== ROLE.ADMIN) {
  //   return { authorized: false, status: 403, message: 'Forbidden: Admin access required' };
  // }
  return { authorized: true, status: 200, message: 'Authorized' };
};


// --- GET: Fetch all agents ---
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
    // Fetch all SalesAgent records and include their associated User data
    const salesAgents = await prisma.salesAgent.findMany({
      where: { companyId },
      include: {
        user: true, // This will fetch the related User model data
      },
      orderBy: {
        createdAt: 'desc', // Order by creation date, newest first
      },
    });

    // Map the Prisma results to the frontend's AgentProfile type
    const agents: AgentProfile[] = salesAgents.map(sa => ({
      id: sa.id,
      name: sa.user.name || '',
      email: sa.user.email,
      phone: sa.user.phone || '',
      bio: sa.user.bio || '',
      profileImageUrl: sa.user.profilePicture || '',
      isActive: sa.isActive,
      specialties: sa.specialties,
      regions: sa.regions,
      totalListings: 0, // Placeholder: Update if you add this to SalesAgent model
      closedDeals: 0,   // Placeholder: Update if you add this to SalesAgent model
      joinedAt: sa.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(agents, { status: 200 });

  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

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
      bio,
      profileImageUrl,
      isActive = true, // Default to true if not provided
      specialties = [],
      regions = [],
      companyId, // Assuming companyId is passed for new agents
    } = await req.json();

    // 1. Basic Input Validation
    if (!name || !email || !phone || !bio || !companyId) {
      return NextResponse.json({ message: 'Missing required fields: name, email, phone, bio, companyId' }, { status: 400 });
    }

    // 2. Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }

    // 3. Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10
    }

    // 4. Create User record
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: ROLE.SALES_AGENT, // Assign SALES_AGENT role
        phone,
        bio,
        profilePicture: profileImageUrl,
        emailVerified: new Date(), // Mark as verified for simplicity
      },
    });

    // 5. Generate a simple login code (you might want a more robust generation)
    const loginCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // e.g., "ABC123"

    // 6. Create SalesAgent record, linking to the new User
    const newSalesAgent = await prisma.salesAgent.create({
      data: {
        userId: newUser.id,
        loginCode,
        phoneNumber: phone, // Using phone from User for SalesAgent as well
        companyId,
        isActive,
        specialties,
        regions, // Initialize
        // Note: totalListings and closedDeals are not in your Prisma schema for SalesAgent.
        // If they are meant to be directly stored, you'll need to add them to your schema.
        // For now, I'm including them in the response for consistency with frontend type.
      },
      include: {
        user: true, // Include user data for the response
      },
    });

    // Combine data for the frontend AgentProfile type
    const agentProfile = {
      id: newSalesAgent.id,
      name: newUser.name || '',
      email: newUser.email,
      phone: newUser.phone || '',
      bio: newUser.bio || '',
      profileImageUrl: newUser.profilePicture || '',
      isActive: newSalesAgent.isActive,
      specialties: newSalesAgent.specialties,
      regions: newSalesAgent.regions,
      totalListings: 0, // Placeholder, as not in Prisma SalesAgent
      closedDeals: 0,   // Placeholder, as not in Prisma SalesAgent
      joinedAt: newSalesAgent.createdAt?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json({ message: 'Agent created successfully', agent: agentProfile }, { status: 201 });

  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
