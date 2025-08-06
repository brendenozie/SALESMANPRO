// app/api/admin/[adminSlug]/clients/[clientId]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path

// PUT /api/admin/[adminSlug]/clients/[clientId]
// Updates an existing client's details.
export async function PUT(request, { params }) {
  const { adminSlug, clientId } = params;

  try {
    const body = await request.json();
    const {
      name, // User's name
      email, // User's email
      phone, // User's phone
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
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!existingClient || existingClient.companyId !== company.id) {
      return NextResponse.json({ message: 'Client not found or does not belong to this company.' }, { status: 404 });
    }

    // Use a Prisma transaction for atomicity if updating both User and Client
    const updatedClientData = await prisma.$transaction(async (tx) => {
      // Update the associated User record
      const updatedUser = await tx.user.update({
        where: { id: existingClient.userId },
        data: {
          name: name,
          email: email, // Email update might need re-verification in a real app
          phone: phone || null,
          // Do NOT update password here unless explicitly provided and hashed
        },
      });

      // Update the Client profile
      const updatedClient = await tx.client.update({
        where: { id: clientId },
        data: {
          membershipType: membershipType,
          membershipStatus: membershipStatus,
          photoUrl: photoUrl || null,
          lastActive: new Date(), // Update last active date on edit
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });
      return updatedClient;
    });

    // Format the updated client data for frontend display
    const formattedUpdatedClient = {
      id: updatedClientData.id,
      userId: updatedClientData.userId,
      name: updatedClientData.user?.name || 'N/A',
      email: updatedClientData.user?.email || 'N/A',
      phone: updatedClientData.user?.phone || 'N/A',
      membershipType: updatedClientData.membershipType || 'Standard',
      membershipStatus: updatedClientData.membershipStatus,
      joinDate: updatedClientData.joinDate.toISOString().split('T')[0],
      lastActive: updatedClientData.lastActive.toISOString().split('T')[0],
      photoUrl: updatedClientData.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
    };

    return NextResponse.json(formattedUpdatedClient);
  } catch (error) {
    console.error(`Error updating client ${clientId}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: 'Client not found.' }, { status: 404 });
    }
    if (error.code === 'P2002') { // Unique constraint violation (e.g., email already exists)
      return NextResponse.json({ message: 'Another user with this email already exists.', error: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to update client', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/[adminSlug]/clients/[clientId]
// Deletes a specific client profile.
export async function DELETE(request, { params }) {
  const { adminSlug, clientId } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const clientToDelete = await prisma.client.findUnique({
      where: { id: clientId },
      select: { companyId: true, userId: true },
    });

    if (!clientToDelete || clientToDelete.companyId !== company.id) {
      return NextResponse.json({ message: 'Client not found or does not belong to this company.' }, { status: 404 });
    }

    // Delete the Client profile. Due to `onDelete: Cascade` on the `user` relation
    // in the Client model, deleting the Client will also delete the associated User.
    await prisma.client.delete({
      where: { id: clientId },
    });

    return NextResponse.json({ message: 'Client deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting client ${clientId}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Client not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete client', error: error.message }, { status: 500 });
  }
}
