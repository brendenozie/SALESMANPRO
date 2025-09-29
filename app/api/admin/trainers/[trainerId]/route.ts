// app/api/admin/[adminSlug]/trainers/[trainerId]/route.ts
import prisma from '@/server/db/prismadb';
import { formatResponse } from "@/lib/formatResponse";

import { withApiHandler } from '@/lib/hooks/withApiHandler';

// PUT /api/admin/[adminSlug]/trainers/[trainerId]
// Updates an existing trainer
async function handlePUT(request: Request, { params }: { params: { adminSlug: string; trainerId: string } }) {
  const { adminSlug, trainerId } = params;

  try {
    const body = await request.json();
    const { name, email, phone, specialty, bio, certifications, photoUrl, status } = body;

    const company = await prisma.company.findUnique({ where: { slug: adminSlug }, select: { id: true } });
    if (!company) return formatResponse(false, null, 'Company not found', 404);

    const existingTrainer = await prisma.educator.findUnique({
      where: { id: trainerId },
      include: { user: true },
    });
    if (!existingTrainer || existingTrainer.companyId !== company.id) {
      return formatResponse(false, null, 'Trainer not found or does not belong to this company', 404);
    }

    const updatedTrainerData = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: existingTrainer.userId },
        data: { name, email, phone: phone || null },
      });

      const updatedEducator = await tx.educator.update({
        where: { id: trainerId },
        data: {
          specialty,
          bio: bio || null,
          certifications: certifications || [],
          photoUrl: photoUrl || null,
          status,
        },
        include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      });

      return updatedEducator;
    });

    return formatResponse(true, {
      id: updatedTrainerData.id,
      userId: updatedTrainerData.userId,
      name: updatedTrainerData.user?.name ?? 'N/A',
      email: updatedTrainerData.user?.email ?? 'N/A',
      phone: updatedTrainerData.user?.phone ?? 'N/A',
      specialty: updatedTrainerData.specialty ?? 'General Fitness',
      bio: updatedTrainerData.bio ?? 'No bio available.',
      certifications: updatedTrainerData.certifications ?? [],
      photoUrl: updatedTrainerData.photoUrl ?? 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
      status: updatedTrainerData.status,
    });
  } catch (error: any) {
    console.error(`Error updating trainer ${trainerId}:`, error);
    if (error.code === 'P2025') return formatResponse(false, null, 'Trainer not found', 404);
    if (error.code === 'P2002') return formatResponse(false, null, 'Another user with this email already exists', 409);
    return formatResponse(false, null, 'Failed to update trainer', 500);
  }
}

// DELETE /api/admin/[adminSlug]/trainers/[trainerId]
// Deletes a specific trainer
async function handleDELETE(request: Request, { params }: { params: { adminSlug: string; trainerId: string } }) {
  const { adminSlug, trainerId } = params;

  


  try {
    const company = await prisma.company.findUnique({ where: { slug: adminSlug }, select: { id: true } });
    if (!company) return formatResponse(false, null, 'Company not found', 404);

    const trainerToDelete = await prisma.educator.findUnique({
      where: { id: trainerId },
      select: { companyId: true },
    });
    if (!trainerToDelete || trainerToDelete.companyId !== company.id) {
      return formatResponse(false, null, 'Trainer not found or does not belong to this company', 404);
    }

    await prisma.educator.delete({ where: { id: trainerId } });
    return formatResponse(true, { message: 'Trainer deleted successfully.' });
  } catch (error: any) {
    console.error(`Error deleting trainer ${trainerId}:`, error);
    if (error.code === 'P2025') return formatResponse(false, null, 'Trainer not found', 404);
    return formatResponse(false, null, 'Failed to delete trainer', 500);
  }
}

// Export handlers wrapped with withApiHandler
export const PUT = withApiHandler(handlePUT);
export const DELETE = withApiHandler(handleDELETE);
