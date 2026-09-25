import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/photos/:id
export const GET = withApiHandler(async (request: Request, context: any) => {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Photo ID is required", 400);

  const cacheKey = buildTenantCacheKey(id, "photos", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { mediaAsset: true },
  });

  if (!photo) {
    return formatResponse(false, null, "Photo not found", 404);
  }

  const formatted = {
    id: photo.id,
    title: photo.title,
    description: photo.description,
    imageUrl: photo.mediaAsset?.url || "",
    tags: photo.tags,
    albumId: photo.albumId,
    companyId: photo.companyId,
  };

  try {
    await cacheSet(cacheKey, formatted, 60);
  } catch (e) {}

  return formatResponse(true, formatted, null, 200);
});

// PUT /api/admin/photos/:id
export const PUT = withApiHandler(async (request: Request, context: any) => {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Photo ID is required", 400);

  const body = await request.json();
  const { title, description, imageUrl, tags } = body;

  try {
    const existing = await prisma.photo.findUnique({
      where: { id },
      include: { mediaAsset: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Photo not found", 404);
    }

    if (imageUrl && existing.mediaAssetId) {
      await prisma.mediaAsset.update({
        where: { id: existing.mediaAssetId },
        data: { url: imageUrl, updatedAt: new Date() },
      });
    }

    const updatedPhoto = await prisma.photo.update({
      where: { id },
      data: {
        title,
        description,
        tags: tags || existing.tags,
        updatedAt: new Date(),
      },
      include: { mediaAsset: true },
    });

    const formatted = {
      id: updatedPhoto.id,
      title: updatedPhoto.title,
      description: updatedPhoto.description,
      imageUrl: updatedPhoto.mediaAsset?.url || imageUrl || "",
      tags: updatedPhoto.tags,
      albumId: updatedPhoto.albumId,
    };

    try {
      await cacheDel(`tenant:${id}:photos:*`);
      await cacheDel(`admin:photos:*`);
    } catch (e) {}

    return formatResponse(true, formatted, null, 200);
  } catch (err: any) {
    if (err.code === "P2025") {
      return formatResponse(false, null, "Photo not found", 404);
    }
    return formatResponse(false, null, err.message || "Failed to update photo", 500);
  }
});

// DELETE /api/admin/photos/:id
export const DELETE = withApiHandler(async (request: Request, context: any) => {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Photo ID is required", 400);

  try {
    const existing = await prisma.photo.findUnique({
      where: { id },
      select: { id: true, mediaAssetId: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Photo not found", 404);
    }

    await prisma.$transaction([
      prisma.photo.delete({ where: { id } }),
      ...(existing.mediaAssetId
        ? [prisma.mediaAsset.delete({ where: { id: existing.mediaAssetId } })]
        : []),
    ]);

    try {
      await cacheDel(`tenant:${id}:photos:*`);
      await cacheDel(`admin:photos:*`);
    } catch (e) {}

    return formatResponse(true, null, "Photo deleted successfully", 200);
  } catch (err: any) {
    if (err.code === "P2025") {
      return formatResponse(false, null, "Photo not found", 404);
    }
    return formatResponse(false, null, err.message || "Failed to delete photo", 500);
  }
});
