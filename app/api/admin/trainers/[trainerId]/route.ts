// app/api/admin/[adminSlug]/trainers/[trainerId]/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path

// PUT /api/admin/[adminSlug]/trainers/[trainerId]
// Updates an existing trainer's details.
export async function PUT(request, { params }) {
  const { adminSlug, trainerId } = params;

  try {
    const body = await request.json();
    const {
      name, // User's name
      email, // User's email
      phone, // User's phone
      specialty,
      bio,
      certifications,
      photoUrl,
      status, // EducatorStatus
    } = body;

    // 1. Verify company and trainer existence
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const existingTrainer = await prisma.educator.findUnique({
      where: { id: trainerId },
      include: { user: true },
    });

    if (!existingTrainer || existingTrainer.companyId !== company.id) {
      return NextResponse.json({ message: 'Trainer not found or does not belong to this company.' }, { status: 404 });
    }

    // Use a Prisma transaction for atomicity if updating both User and Educator
    const updatedTrainerData = await prisma.$transaction(async (tx) => {
      // Update the associated User record
      const updatedUser = await tx.user.update({
        where: { id: existingTrainer.userId },
        data: {
          name: name,
          email: email, // Email update might need re-verification in a real app
          phone: phone || null,
          // Do NOT update password here unless explicitly provided and hashed
        },
      });

      // Update the Educator profile
      const updatedEducator = await tx.educator.update({
        where: { id: trainerId },
        data: {
          specialty: specialty,
          bio: bio || null,
          certifications: certifications || [],
          photoUrl: photoUrl || null,
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
      return updatedEducator;
    });

    // Format the updated trainer data for frontend display
    const formattedUpdatedTrainer = {
      id: updatedTrainerData.id,
      userId: updatedTrainerData.userId,
      name: updatedTrainerData.user?.name || 'N/A',
      email: updatedTrainerData.user?.email || 'N/A',
      phone: updatedTrainerData.user?.phone || 'N/A',
      specialty: updatedTrainerData.specialty || 'General Fitness',
      bio: updatedTrainerData.bio || 'No bio available.',
      certifications: updatedTrainerData.certifications || [],
      photoUrl: updatedTrainerData.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
      status: updatedTrainerData.status,
    };

    return NextResponse.json(formattedUpdatedTrainer);
  } catch (error) {
    console.error(`Error updating trainer ${trainerId}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: 'Trainer not found.' }, { status: 404 });
    }
    if (error.code === 'P2002') { // Unique constraint violation (e.g., email already exists)
      return NextResponse.json({ message: 'Another user with this email already exists.', error: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to update trainer', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/[adminSlug]/trainers/[trainerId]
// Deletes a specific trainer profile.
export async function DELETE(request, { params }) {
  const { adminSlug, trainerId } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found.' }, { status: 404 });
    }

    const trainerToDelete = await prisma.educator.findUnique({
      where: { id: trainerId },
      select: { companyId: true, userId: true },
    });

    if (!trainerToDelete || trainerToDelete.companyId !== company.id) {
      return NextResponse.json({ message: 'Trainer not found or does not belong to this company.' }, { status: 404 });
    }

    // Delete the Educator profile. Due to `onDelete: Cascade` on the `user` relation
    // in the Educator model, deleting the Educator will also delete the associated User.
    await prisma.educator.delete({
      where: { id: trainerId },
    });

    return NextResponse.json({ message: 'Trainer deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting trainer ${trainerId}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Trainer not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete trainer', error: error.message }, { status: 500 });
  }
}
