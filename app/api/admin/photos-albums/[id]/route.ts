import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/photos-albums/[id]
export const GET = withApiHandler(async (_request: Request, context: any) => {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Album ID is required", 400);

  const cacheKey = buildTenantCacheKey(id, "photos-albums", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const photoAlbum = await prisma.photoAlbum.findUnique({
    where: { id },
    include: {
      photos: {
        include: { mediaAsset: true },
      },
    },
  });

  if (!photoAlbum) {
    return formatResponse(false, null, "Photo album not found", 404);
  }

  const formatted = {
    id: photoAlbum.id,
    title: photoAlbum.title,
    description: photoAlbum.description,
    tags: photoAlbum.tags,
    companyId: photoAlbum.companyId,
    photos: (photoAlbum.photos || []).map((p) => ({
      id: p.id,
      imageUrl: p.mediaAsset?.url || "",
      title: p.title,
      altText: p.altText,
    })),
  };

  try {
    await cacheSet(cacheKey, formatted, 60);
  } catch (e) {}

  return formatResponse(true, formatted, null, 200);
});

// PUT /api/admin/photos-albums/[id]
export const PUT = withApiHandler(async (request: Request, context: any) => {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Album ID is required", 400);

  const body = await request.json();
  const { title, description, tags } = body;

  const updatedPhotoAlbum = await prisma.photoAlbum.update({
    where: { id },
    data: {
      title,
      description,
      tags: tags || [],
      updatedAt: new Date(),
    },
    include: {
      photos: {
        include: { mediaAsset: true },
      },
    },
  });

  const formatted = {
    id: updatedPhotoAlbum.id,
    title: updatedPhotoAlbum.title,
    description: updatedPhotoAlbum.description,
    tags: updatedPhotoAlbum.tags,
    photos: (updatedPhotoAlbum.photos || []).map((p) => ({
      id: p.id,
      imageUrl: p.mediaAsset?.url || "",
      title: p.title,
    })),
  };

  try {
    await cacheDel(`tenant:${id}:photos-albums:*`);
    await cacheDel(`admin:photos-albums:*`);
  } catch (e) {}

  return formatResponse(true, formatted, "Photo album updated successfully", 200);
});

// DELETE /api/admin/photos-albums/[id]
export const DELETE = withApiHandler(async (_request: Request, context: any) => {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Album ID is required", 400);

  // Find photos in album to delete them safely
  const photos = await prisma.photo.findMany({
    where: { albumId: id },
    select: { id: true, mediaAssetId: true },
  });

  const photoIds = photos.map((p) => p.id);
  const mediaAssetIds = photos.map((p) => p.mediaAssetId).filter(Boolean);

  await prisma.$transaction([
    prisma.photo.deleteMany({ where: { id: { in: photoIds } } }),
    prisma.mediaAsset.deleteMany({ where: { id: { in: mediaAssetIds } } }),
    prisma.photoAlbum.delete({ where: { id } }),
  ]);

  try {
    await cacheDel(`tenant:${id}:photos-albums:*`);
    await cacheDel(`admin:photos-albums:*`);
  } catch (e) {}

  return formatResponse(true, null, "Photo album deleted successfully", 200);
});
