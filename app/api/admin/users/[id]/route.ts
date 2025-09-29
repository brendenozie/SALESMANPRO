import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { Plan, UserStatus, ROLE } from '@prisma/client';
import { formatResponse } from "@/lib/formatResponse";


// PUT /api/users/[id]
// Handles updating an existing user.
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = params; // Get the user ID from the URL params
    const { companyId, ...userData } = await request.json();

    // Check if the user ID is valid
    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prepare data for update
    let updateData: any = { ...userData };

    // Handle company connection if companyId is provided
    if (companyId) {
      updateData.company = {
        connect: {
          id: companyId,
        },
      };
    } else {
      // If companyId is not provided, disconnect the user from any company
      // This is an optional behavior, but good practice for a full PUT request
      updateData.company = { disconnect: true };
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Failed to update user', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]
// Handles deleting a user.
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = params; // Get the user ID from the URL params

    // Check if the user ID is valid
    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Delete the user
    await prisma.user.delete({ where: { id } });

    // Return a 204 No Content response for successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Failed to delete user', error: (error as Error).message },
      { status: 500 }
    );
  }
}
