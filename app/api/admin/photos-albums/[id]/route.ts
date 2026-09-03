import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/photo-albums/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// 
export const GET = withApiHandler(async (_request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;

  const cacheKey = buildTenantCacheKey(id, "photos-albums", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
  const photoAlbum = await prisma.photoAlbum.findUnique({
    where: { id },
    include: { photos: true },
  });

  try {
    if (photoAlbum) {
      await cacheSet(cacheKey, photoAlbum, 60);
    }
  } catch (e) {}

  if (!photoAlbum) {
    return formatResponse(false, null, "Photo album not found", 404);
  }

  return formatResponse(true, photoAlbum, null, 200);
});

// 
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

  
    try {
      await cacheDel(`tenant:${id}:photos-albums:*`);
      await cacheDel(`admin:photos-albums:*`);
    } catch (e) {}
    return formatResponse(true, updatedPhotoAlbum, null, 200);
});

// 
export const DELETE = withApiHandler(async (_request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;

  await prisma.$transaction([
    prisma.photo.deleteMany({ where: { albumId: id } }),
    prisma.photoAlbum.delete({ where: { id } }),
  ]);
  
    try {
      await cacheDel(`tenant:${id}:photos-albums:*`);
      await cacheDel(`admin:photos-albums:*`);
    } catch (e) {}
    return formatResponse(true, null, "Photo album deleted successfully", 204);
});
