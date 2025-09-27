// app/api/photo-albums/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * @route GET /api/photo-albums/:id
 * @description Fetches a single photo album by ID.
 */
export const GET = withApiHandler(async (_request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;

  const photoAlbum = await prisma.photoAlbum.findUnique({
    where: { id },
    include: { photos: true },
  });

  if (!photoAlbum) {
    return formatResponse(false, null, "Photo album not found", 404);
  }

  return formatResponse(true, photoAlbum, null, 200);
});

/**
 * @route PUT /api/photo-albums/:id
 * @description Updates an existing photo album's metadata.
 */
export const PUT = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;
  const body = await request.json();
  const { title, description, tags } = body;

  const updatedPhotoAlbum = await prisma.photoAlbum.update({
    where: { id },
    data: {
      title,
      description,
      tags,
      updatedAt: new Date(),
    },
    include: { photos: true },
  });

  return formatResponse(true, updatedPhotoAlbum, null, 200);
});

/**
 * @route DELETE /api/photo-albums/:id
 * @description Deletes a photo album and all its associated photos.
 */
export const DELETE = withApiHandler(async (_request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;

  await prisma.$transaction([
    prisma.photo.deleteMany({ where: { albumId: id } }),
    prisma.photoAlbum.delete({ where: { id } }),
  ]);

  return formatResponse(true, null, "Photo album deleted successfully", 204);
});
