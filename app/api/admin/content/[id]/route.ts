import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/content/[id]/route.ts
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { Prisma } from '@prisma/client';

// Define a reusable selection object to avoid over-fetching nested media
const CONTENT_SELECT = {
  id: true,
  title: true,
  type: true,
  status: true,
  publishDate: true,
  photoAlbumId: true,
  videoAlbumId: true,
  photoAlbum: {
    select: { id: true, title: true } // Don't fetch all photos here
  },
  videoAlbum: {
    select: { id: true, title: true } // Don't fetch all videos here
  },
  updatedAt: true,
};


export const GET = withApiHandler(async (_req, { params }) => {
  const { id } = params;

  const cacheKey = `admin:content:${id || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const content = await prisma.content.findUnique({
    where: { id },
    select: CONTENT_SELECT,
  });

  if (!content) {
    return formatResponse(false, null, 'Content not found', 404);
  }

  try {
    if (content) {
      await cacheSet(cacheKey, content, 60);
    }
  } catch (e) {}

  return formatResponse(true, content);
});


export const PUT = withApiHandler(async (request, { params }) => {
  const { id } = params;
  const body = await request.json();
  const cacheKey = `admin:content:${id || 'global'}:all`;
  try {
    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        title: body.title,
        type: body.type,
        status: body.status,
        photoAlbumId: body.photoAlbumId,
        videoAlbumId: body.videoAlbumId,
        // Ensure publishDate is a valid Date object if provided
        publishDate: body.publishDate ? new Date(body.publishDate) : undefined,
      },
      select: CONTENT_SELECT,
    });

    // Clear cache for this specific content item
    try { await cacheDel(cacheKey); } catch (e) {}
    return formatResponse(true, updatedContent, 'Content updated successfully');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, 'Content not found', 404);
    }
    throw error;
  }
});


export const DELETE = withApiHandler(async (_req, { params }) => {
  const { id } = params;

  try {
    await prisma.content.delete({ where: { id } });
    
    try { await cacheDel(`admin:content:${id || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, 'Content deleted', 200); // 204 doesn't usually return a body
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return formatResponse(false, null, 'Content not found', 404);
    }
    throw error;
  }
});
//  => {
//   const { id } = params;

//   const content = await prisma.content.findUnique({
//     where: { id },
//     include: {
//       photoAlbum: { include: { photos: true } },
//       videoAlbum: { include: { videos: true } },
//     },
//   });

//   if (!content) {
//     return formatResponse(false, null, 'Content not found', 404);
//   }

//   return formatResponse(true, content, null, 200);
// });

// 
// export const PUT = withApiHandler(async (request, { params }) => {
//   const { id } = params;
//   const body = await request.json();
//   const { title, type, publishDate, status, photoAlbumId, videoAlbumId } = body;

//   const updatedContent = await prisma.content.update({
//     where: { id },
//     data: {
//       title,
//       type,
//       status,
//       publishDate,
//       photoAlbumId,
//       videoAlbumId,
//       updatedAt: new Date(),
//     },
//     include: {
//       photoAlbum: { include: { photos: true } },
//       videoAlbum: { include: { videos: true } },
//     },
//   });

//   return formatResponse(true, updatedContent, null, 200);
// });

// 
// export const DELETE = withApiHandler(async (request, { params }) => {
//   const { id } = params;

//   await prisma.content.delete({ where: { id } });
//   return formatResponse(true, null, null, 204);
// });
