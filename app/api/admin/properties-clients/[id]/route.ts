import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";


// Mock authentication/authorization for demonstration
const authorizeAdmin = async (req: Request) => {
  // This is a placeholder. Implement real authentication/authorization here.
  // const userId = getUserIdFromSession(req);
  // const user = await prisma.user.findUnique({ where: { id: userId } });
  // if (!user || user.role !== ROLE.ADMIN) {
  //   return { authorized: false, status: 403, message: 'Forbidden: Admin access required' };
  // }
  return { authorized: true, status: 200, message: 'Approved' };
};

// --- PUT: Update an existing client ---
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const clientId = params.id;

  try {
    const {
      name,
      email,
      phone,
      bio,
      salesAgentId, // Can be updated
      inquiryCount,
      dealStatus,
      lastActivity,
      notes,
      preferredPropertyTypes,
      budgetRange,
    } = await req.json();

    // 1. Find the Client and its associated User
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    // 2. Update User details
    const updatedUser = await prisma.user.update({
      where: { id: client.userId },
      data: {
        name: name !== undefined ? name : client.user.name,
        email: email !== undefined ? email : client.user.email,
        phone: phone !== undefined ? phone : client.user.phone,
        bio: bio !== undefined ? bio : client.user.bio,
      },
    });

    // 3. Update Client details
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        salesAgentId: salesAgentId !== undefined ? salesAgentId : client.salesAgentId,
        inquiryCount: inquiryCount !== undefined ? inquiryCount : client.inquiryCount,
        dealStatus: dealStatus !== undefined ? dealStatus : client.dealStatus,
        lastActivity: lastActivity !== undefined ? new Date(lastActivity) : client.lastActivity,
        notes: notes !== undefined ? notes : client.notes,
        preferredPropertyTypes: preferredPropertyTypes !== undefined ? preferredPropertyTypes : client.preferredPropertyTypes,
        budgetRange: budgetRange !== undefined ? budgetRange : client.budgetRange,
      },
      include: {
        user: true, // Include user data for the response
      },
    });

    // Map the updated client data to the frontend's ClientProfile type
    const clientProfile = {
      id: updatedClient.id,
      name: updatedUser.name || '',
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      inquiryCount: updatedClient.inquiryCount || 0,
      dealStatus: (updatedClient.dealStatus as 'Lead' | 'Active' | 'Closed' | 'Archived') || 'Lead',
      lastActivity: updatedClient.lastActivity?.toISOString() || updatedClient.createdAt?.toISOString() || new Date().toISOString(),
      notes: updatedClient.notes || '',
      preferredPropertyTypes: updatedClient.preferredPropertyTypes || [],
      budgetRange: updatedClient.budgetRange || '',
    };

    return NextResponse.json({ message: 'Client updated successfully', client: clientProfile }, { status: 200 });

  } catch (error) {
    console.error('Error updating client:', error);
    // if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
    //   return NextResponse.json({ message: 'Email already in use by another user.' }, { status: 409 });
    // }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// --- DELETE: Delete a client ---
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const clientId = params.id;

  try {
    // 1. Find the Client to get its associated userId
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { userId: true },
    });

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    // 2. Delete the Client record
    await prisma.client.delete({
      where: { id: clientId },
    });

    // 3. Delete the associated User record
    // Consider business logic: Do you always delete the User, or just the Client profile?
    // If a user can have multiple roles, you might just remove the Client profile.
    // For this example, we'll delete the User as well.
    await prisma.user.delete({
      where: { id: client.userId },
    });

    return NextResponse.json({ message: 'Client deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
