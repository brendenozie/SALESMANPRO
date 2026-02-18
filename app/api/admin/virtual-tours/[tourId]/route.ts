import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/[adminSlug]/virtual-tours/[tourId]/route.ts
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// PUT /api/admin/[adminSlug]/virtual-tours/[tourId]
export const PUT = withApiHandler(async (request, { params }) => {
  const { adminSlug, tourId } = params;

  const body = await request.json();
  const {
    title,
    location,
    duration,
    category,
    videoUrl,
    thumbnailUrl,
    description,
    published,
  } = body;

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found.', 404);
  }

  const existingTour = await prisma.content.findUnique({
    where: { id: tourId },
    select: { companyId: true },
  });

  if (!existingTour || existingTour.companyId !== company.id) {
    return formatResponse(false, null, 'Virtual tour not found or does not belong to this company.', 404);
  }

  const updatedTour = await prisma.content.update({
    where: { id: tourId },
    data: {
      title,
      location,
      duration,
      category,
      contentUrl: videoUrl,
      thumbnailUrl,
      description: description || null,
      published,
    },
  });

  const formattedUpdatedTour = {
    id: updatedTour.id,
    title: updatedTour.title,
    location: updatedTour.location || 'N/A',
    duration: updatedTour.duration || 'N/A',
    category: updatedTour.category || 'Uncategorized',
    videoUrl: updatedTour.contentUrl || 'N/A',
    thumbnailUrl:
      updatedTour.thumbnailUrl ||
      'https://placehold.co/400x250/E0E7FF/4338CA?text=No+Thumbnail',
    description: updatedTour.description || '',
    published: updatedTour.published,
  };

  
    try { await cacheDel(`admin:virtual-tours:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, formattedUpdatedTour, 'Virtual tour updated successfully.', 200);
});

// DELETE /api/admin/[adminSlug]/virtual-tours/[tourId]
export const DELETE = withApiHandler(async (_request, { params }) => {
  const { adminSlug, tourId } = params;

  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found.', 404);
  }

  const tourToDelete = await prisma.content.findUnique({
    where: { id: tourId },
    select: { companyId: true },
  });

  if (!tourToDelete || tourToDelete.companyId !== company.id) {
    return formatResponse(false, null, 'Virtual tour not found or does not belong to this company.', 404);
  }

  await prisma.content.delete({
    where: { id: tourId },
  });

  
    try { await cacheDel(`admin:virtual-tours:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, 'Virtual tour deleted successfully.', 200);
});
