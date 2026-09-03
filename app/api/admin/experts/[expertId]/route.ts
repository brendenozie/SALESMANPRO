import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler'; // New import
import { formatResponse } from '@/lib/formatResponse'; // New import

// Define the type for the dynamic segments from the URL
interface Params {
  params: { adminSlug: string; expertId: string };
}

// Define the Expert type based on your Prisma schema
type Expert = {
  id: string;
  userId: string | null;
  user?: {
    id: string | null;
    name: string | null;
    email: string | null;
    phone?: string | null;
  } | null;
  companyId: string;
  specialty: string;
  experienceYears: number | null;
  travelsCompleted: number | null;
  photoUrl?: string | null;
  bio?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: string;
};

// Helper function to format the expert data for response
function formatExpertData(expertData : Expert) {
  return {
    id: expertData.id,
    userId: expertData.userId,
    name: expertData.user?.name || 'N/A',
    email: expertData.user?.email || 'N/A',
    phone: expertData.user?.phone || 'N/A',
    specialty: expertData.specialty,
    experienceYears: expertData.experienceYears,
    travelsCompleted: expertData.travelsCompleted,
    photoUrl: expertData.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
    bio: expertData.bio || '',
    contactEmail: expertData.contactEmail || '',
    contactPhone: expertData.contactPhone || '',
    status: expertData.status,
  };
}

// PUT /api/admin/[adminSlug]/experts/[expertId]
// Updates an existing expert's details.
async function updateExpert(request: Request, { params }: Params) {
  
  const { adminSlug, expertId } = params;

  const body = await request.json();
  const {
    name, email, phone, specialty, experienceYears, travelsCompleted, photoUrl,
    bio, contactEmail, contactPhone, status,
  } = body;

  // 1. Verify company and expert existence
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found.', 404);
  }

  const existingExpert = await prisma.expert.findUnique({
    where: { id: expertId },
    include: { user: true },
  });

  if (!existingExpert || existingExpert.companyId !== company.id) {
    return formatResponse(false, null, 'Expert not found or does not belong to this company.', 404);
  }

  // Ensure the expert has an associated user before attempting to update
  if (!existingExpert.userId) {
    return formatResponse(false, null, 'Associated user not found for this expert.', 404);
  }
  const userId = existingExpert.userId;

  // Use a local try/catch for specific Prisma error codes, allowing withApiHandler to handle generic errors
  try {
    const updatedExpertData = await prisma.$transaction(async (tx) => {
      // Update the associated User record
      await tx.user.update({
        where: { id: userId },
        data: {
          name: name,
          email: email,
          phone: phone || null,
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
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      });
      return updatedExpert;
    });

    const formattedUpdatedExpert = formatExpertData(updatedExpertData);

    try {
      await cacheDel(`tenant:${company.id}:experts:*`);
      await cacheDel(`admin:experts:*`);
    } catch (e) {}

    return formatResponse(true, { data: formattedUpdatedExpert }, null, 200);

  } catch (error: any) {
    console.error(`Error updating expert ${expertId}:`, error);

    if (error.code === 'P2025') {
      return formatResponse(false, null, 'Expert not found.', 404);
    }
    if (error.code === 'P2002') {
      return formatResponse(false, null, 'Another user with this email already exists.', 409);
    }
    // Re-throw to be caught by withApiHandler for generic 500 handling
    throw error;
  }
}

// DELETE /api/admin/[adminSlug]/experts/[expertId]
// Deletes a specific expert profile.
async function deleteExpert(request: Request, { params }: Params) {
  
  const { adminSlug, expertId } = params;

  // 1. Verify company and expert existence
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found.', 404);
  }

  const expertToDelete = await prisma.expert.findUnique({
    where: { id: expertId },
    select: { companyId: true, userId: true },
  });

  if (!expertToDelete || expertToDelete.companyId !== company.id) {
    return formatResponse(false, null, 'Expert not found or does not belong to this company.', 404);
  }

  // Use a local try/catch for specific Prisma error codes
  try {
    // 2. Delete the Expert profile
    await prisma.expert.delete({
      where: { id: expertId },
    });
    
    try {
      await cacheDel(`tenant:${company.id}:experts:*`);
      await cacheDel(`admin:experts:*`);
    } catch (e) {}
    
    return formatResponse(true, { message: 'Expert deleted successfully.' }, null, 200);

  } catch (error : any) {
    console.error(`Error deleting expert ${expertId}:`, error);
    if (error.code === 'P2025') {
      return formatResponse(false, null, 'Expert not found.', 404);
    }
    // Re-throw to be caught by withApiHandler for generic 500 handling
    throw error;
  }
}

// Export the refactored handlers wrapped in withApiHandler
export const PUT = withApiHandler(updateExpert);
export const DELETE = withApiHandler(deleteExpert);
