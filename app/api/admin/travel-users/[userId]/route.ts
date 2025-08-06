// app/api/admin/[adminSlug]/users/[userId]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path if your prisma client is elsewhere

// DELETE /api/admin/[adminSlug]/users/[userId]
// Deletes a specific user by ID.
export async function DELETE(request: Request, { params }) {
  const { adminSlug, userId } = params;

  try {
    // 1. Verify company and user existence (optional but good for security)
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!userToDelete || userToDelete.companyId !== company.id) {
      return NextResponse.json({ message: 'User not found or does not belong to this company.' }, { status: 404 });
    }

    // 2. Delete the user
    // Prisma's onDelete: Cascade in your schema handles associated records (Account, Session, etc.)
    // For other one-to-one profiles (Client, Consumer, etc.) linked to User,
    // ensure their relations in schema.prisma have `onDelete: Cascade` if you want them
    // to be automatically deleted when the User is deleted.
    // Example: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete user', error: error.message }, { status: 500 });
  }
}
