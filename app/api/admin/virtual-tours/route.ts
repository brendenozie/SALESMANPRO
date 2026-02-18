import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/[adminSlug]/virtual-tours/route.ts
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// GET /api/admin/[adminSlug]/virtual-tours
export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  
    const cacheKey = `admin:virtual-tours:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const company = await prisma.company.findUnique({
    where: { id: companyId || undefined },
    select: { id: true },
  });

  try {
    if (company) {
      await cacheSet(cacheKey, company, 60);
    }
  } catch (e) {}

  if (!company) {
    return formatResponse(false, null, 'Company not found for the given slug.', 404);
  }

  const virtualTours = await prisma.content.findMany({
    where: {
      companyId: company.id,
      contentType: 'VIDEO',
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedTours = virtualTours.map((tour) => ({
    id: tour.id,
    title: tour.title,
    location: tour.location || 'N/A',
    duration: tour.duration || 'N/A',
    category: tour.category || 'Uncategorized',
    videoUrl: tour.contentUrl || 'N/A',
    thumbnailUrl:
      tour.thumbnailUrl ||
      'https://placehold.co/400x250/E0E7FF/4338CA?text=No+Thumbnail',
    description: tour.description || '',
    published: tour.published,
  }));

  return formatResponse(true, formattedTours, 'Virtual tours fetched successfully.', 200);
});

// POST /api/admin/[adminSlug]/virtual-tours
export const POST = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  const company = await prisma.company.findUnique({
    where: { id: companyId || undefined },
    select: { id: true },
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found for the given slug.', 404);
  }

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

  if (!title || !location || !duration || !category || !videoUrl || !thumbnailUrl) {
    return formatResponse(false, null, 'Missing required fields for virtual tour creation.', 400);
  }

  const newVirtualTour = await prisma.content.create({
    data: {
      title,
      location,
      duration,
      category,
      contentUrl: videoUrl,
      thumbnailUrl,
      description: description || null,
      contentType: 'VIDEO',
      published: published || false,
      company: {
        connect: { id: company.id },
      },
      type: 'VIDEO',
    },
  });

  const formattedNewTour = {
    id: newVirtualTour.id,
    title: newVirtualTour.title,
    location: newVirtualTour.location || 'N/A',
    duration: newVirtualTour.duration || 'N/A',
    category: newVirtualTour.category || 'Uncategorized',
    videoUrl: newVirtualTour.contentUrl,
    thumbnailUrl:
      newVirtualTour.thumbnailUrl ||
      'https://placehold.co/400x250/E0E7FF/4338CA?text=No+Thumbnail',
    description: newVirtualTour.description || '',
    published: newVirtualTour.published,
  };

  
    try { await cacheDel(`admin:virtual-tours:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, formattedNewTour, 'Virtual tour created successfully.', 201);
});
