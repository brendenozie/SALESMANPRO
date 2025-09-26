// app/api/content/[id]/route.ts
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

/**
 * @route GET /api/content/:id
 * @description Fetches a single content item.
 */
export const GET = withApiHandler(async (request, { params }) => {
  const { id } = params;

  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      photoAlbum: { include: { photos: true } },
      videoAlbum: { include: { videos: true } },
    },
  });

  if (!content) {
    return formatResponse(false, null, 'Content not found', 404);
  }

  return formatResponse(true, content, null, 200);
});

/**
 * @route PUT /api/content/:id
 * @description Updates a content item.
 */
export const PUT = withApiHandler(async (request, { params }) => {
  const { id } = params;
  const body = await request.json();
  const { title, type, publishDate, status, photoAlbumId, videoAlbumId } = body;

  const updatedContent = await prisma.content.update({
    where: { id },
    data: {
      title,
      type,
      status,
      publishDate,
      photoAlbumId,
      videoAlbumId,
      updatedAt: new Date(),
    },
    include: {
      photoAlbum: { include: { photos: true } },
      videoAlbum: { include: { videos: true } },
    },
  });

  return formatResponse(true, updatedContent, null, 200);
});

/**
 * @route DELETE /api/content/:id
 * @description Deletes a content item.
 */
export const DELETE = withApiHandler(async (request, { params }) => {
  const { id } = params;

  await prisma.content.delete({ where: { id } });
  return formatResponse(true, null, null, 204);
});
