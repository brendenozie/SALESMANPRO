// app/api/admin/[adminSlug]/experts/[expertId]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// PUT /api/admin/[adminSlug]/experts/[expertId]
// Updates an existing expert's details.
export async function PUT(request, { params }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { adminSlug, expertId } = params;

  try {
    const body = await request.json();
    const {
      name, // User's name
      email, // User's email
      phone, // User's phone
      specialty,
      experienceYears,
      travelsCompleted,
      photoUrl,
      bio,
      contactEmail,
      contactPhone,
      status, // ExpertStatus
    } = body;

    // 1. Verify company and expert existence
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const existingExpert = await prisma.expert.findUnique({
      where: { id: expertId },
      include: { user: true },
    });

    if (!existingExpert || existingExpert.companyId !== company.id) {
      return NextResponse.json({ message: 'Expert not found or does not belong to this company.' }, { status: 404 });
    }

    // Use a Prisma transaction for atomicity if updating both User and Expert
    const updatedExpertData = await prisma.$transaction(async (tx) => {
      // Update the associated User record
      const updatedUser = await tx.user.update({
        where: { id: existingExpert.userId },
        data: {
          name: name,
          email: email, // Email update might need re-verification in a real app
          phone: phone || null,
          // Do NOT update password here unless explicitly provided and hashed
        },
      });

      // Update the Expert profile
      const updatedExpert = await tx.expert.update({
        where: { id: expertId },
        data: {
          specialty: specialty,
          experienceYears: parseInt(experienceYears),
          travelsCompleted: parseInt(travelsCompleted),
          photoUrl: photoUrl || null,
          bio: bio || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          status: status,
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
      return updatedExpert;
    });

    // Format the updated expert data for frontend display
    const formattedUpdatedExpert = {
      id: updatedExpertData.id,
      userId: updatedExpertData.userId,
      name: updatedExpertData.user?.name || 'N/A',
      email: updatedExpertData.user?.email || 'N/A',
      phone: updatedExpertData.user?.phone || 'N/A',
      specialty: updatedExpertData.specialty,
      experienceYears: updatedExpertData.experienceYears,
      travelsCompleted: updatedExpertData.travelsCompleted,
      photoUrl: updatedExpertData.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
      bio: updatedExpertData.bio || '',
      contactEmail: updatedExpertData.contactEmail || '',
      contactPhone: updatedExpertData.contactPhone || '',
      status: updatedExpertData.status,
    };

    return NextResponse.json(formattedUpdatedExpert);
  } catch (error) {
    console.error(`Error updating expert ${expertId}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: 'Expert not found.' }, { status: 404 });
    }
    if (error.code === 'P2002') { // Unique constraint violation (e.g., email already exists)
      return NextResponse.json({ message: 'Another user with this email already exists.', error: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to update expert', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/[adminSlug]/experts/[expertId]
// Deletes a specific expert profile.
export async function DELETE(request, { params }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { adminSlug, expertId } = params;

  try {
    // 1. Verify company and expert existence
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const expertToDelete = await prisma.expert.findUnique({
      where: { id: expertId },
      select: { companyId: true, userId: true },
    });

    if (!expertToDelete || expertToDelete.companyId !== company.id) {
      return NextResponse.json({ message: 'Expert not found or does not belong to this company.' }, { status: 404 });
    }

    // 2. Delete the Expert profile
    // Note: This will NOT delete the associated User record unless onDelete: Cascade is set
    // on the Expert model's 'user' relation, AND the User is not linked to other profiles.
    // For this implementation, we assume deleting the Expert profile does not delete the User.
    await prisma.expert.delete({
      where: { id: expertId },
    });

    return NextResponse.json({ message: 'Expert deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting expert ${expertId}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Expert not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete expert', error: error.message }, { status: 500 });
  }
}
