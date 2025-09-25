import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import bcrypt from 'bcryptjs';
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { request } from "http";

// app/api/admin/agents/[id]/route.ts

// Define the ROLE enum if not already globally available
enum ROLE {
  ADMIN = 'ADMIN',
  SALES_AGENT = 'AGENT',
  // ... other roles
}



// Mock authentication/authorization for demonstration
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



// --- PUT: Update an existing agent ---
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const agentId = params.id;

  try {
    const {
      name,
      email,
      phone,
      bio,
      profileImageUrl,
      isActive,
      specialties,
      regions,
      // password is not handled here for updates; typically a separate endpoint
    } = await req.json();

    // 1. Find the SalesAgent and its associated User
    const salesAgent = await prisma.salesAgent.findUnique({
      where: { id: agentId },
      include: { user: true },
    });

    if (!salesAgent) {
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }

    // 2. Update User details
    const updatedUser = await prisma.user.update({
      where: { id: salesAgent.userId },
      data: {
        name: name !== undefined ? name : salesAgent.user.name,
        email: email !== undefined ? email : salesAgent.user.email,
        phone: phone !== undefined ? phone : salesAgent.user.phone,
        bio: bio !== undefined ? bio : salesAgent.user.bio,
        profilePicture: profileImageUrl !== undefined ? profileImageUrl : salesAgent.user.profilePicture,
      },
    });

    // 3. Update SalesAgent details
    const updatedSalesAgent = await prisma.salesAgent.update({
      where: { id: agentId },
      data: {
        isActive: isActive !== undefined ? isActive : salesAgent.isActive,
        specialties: specialties !== undefined ? specialties : salesAgent.specialties,
        regions: regions !== undefined ? regions : salesAgent.regions,
        phoneNumber: phone !== undefined ? phone : salesAgent.phoneNumber, // Update salesAgent's phone as well
      },
      include: {
        user: true, // Include user data for the response
      },
    });

    // Combine data for the frontend AgentProfile type
    const agentProfile = {
      id: updatedSalesAgent.id,
      name: updatedUser.name || '',
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      bio: updatedUser.bio || '',
      profileImageUrl: updatedUser.profilePicture || '',
      isActive: updatedSalesAgent.isActive,
      specialties: updatedSalesAgent.specialties,
      regions: updatedSalesAgent.regions,
      totalListings: 0, // Placeholder, as not in Prisma SalesAgent
      closedDeals: 0,   // Placeholder, as not in Prisma SalesAgent
      joinedAt: updatedSalesAgent.createdAt?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json({ message: 'Agent updated successfully', agent: agentProfile }, { status: 200 });

  } catch (error) {
    console.error('Error updating agent:', error);
    // Handle unique constraint violation for email if email is updated
    // if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
    //   return NextResponse.json({ message: 'Email already in use by another user.' }, { status: 409 });
    // }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// --- DELETE: Delete an agent ---
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  
   const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const agentId = params.id;

  try {
    // 1. Find the SalesAgent to get its associated userId
    const salesAgent = await prisma.salesAgent.findUnique({
      where: { id: agentId },
      select: { userId: true }, // Only need the userId
    });

    if (!salesAgent) {
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }

    // 2. Delete the SalesAgent record
    await prisma.salesAgent.delete({
      where: { id: agentId },
    });

    // 3. Delete the associated User record
    // Consider business logic: Do you always delete the User, or just the SalesAgent profile?
    // If a user can have multiple roles, you might just remove the SalesAgent profile.
    // For this example, we'll delete the User as well.
    await prisma.user.delete({
      where: { id: salesAgent.userId },
    });

    return NextResponse.json({ message: 'Agent deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// function getUserIdFromSession(req: Request): string {
//   // Example: Extract user ID from a JWT in the Authorization header
//   const authHeader = req.headers.get('authorization');
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     throw new Error('No authorization token found');
//   }
//   const token = authHeader.replace('Bearer ', '');
//   // In a real implementation, verify and decode the JWT here
//   // For demonstration, we'll just return a hardcoded user ID or decode a fake token
//   // Example using a JWT library (pseudo-code):
//   const payload = jwt.verify(token, process.env.JWT_SECRET);
//   // return payload.userId;
//   return 'admin-user-id'; // Placeholder for demonstration
// }


