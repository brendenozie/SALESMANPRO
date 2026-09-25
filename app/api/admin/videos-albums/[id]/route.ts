import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/videos-albums/[id]
export const GET = withApiHandler(async (_request: Request, context: any) => {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Album ID is required", 400);

  const cacheKey = buildTenantCacheKey(id, "videos-albums", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const videoAlbum = await prisma.videoAlbum.findUnique({
    where: { id },
    include: {
      videos: {
        include: { mediaAsset: true },
      },
    },
  });

  if (!videoAlbum) {
    return formatResponse(false, null, "Video album not found", 404);
  }

  const formatted = {
    id: videoAlbum.id,
    title: videoAlbum.title,
    description: videoAlbum.description,
    tags: videoAlbum.tags,
    companyId: videoAlbum.companyId,
    videos: (videoAlbum.videos || []).map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      url: v.mediaAsset?.url || "",
      thumbnailUrl: v.mediaAsset?.thumbnailUrl || "",
      duration: v.mediaAsset?.duration ? String(v.mediaAsset.duration) : "0",
      status: v.status,
    })),
  };

  try {
    await cacheSet(cacheKey, formatted, 60);
  } catch (e) {}

  return formatResponse(true, formatted, "Video album fetched successfully", 200);
});

// PUT /api/admin/videos-albums/[id]
export const PUT = withApiHandler(async (request: Request, context: any) => {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Album ID is required", 400);

  const body = await request.json();
  const { title, description, tags } = body;

  const updatedVideoAlbum = await prisma.videoAlbum.update({
    where: { id },
    data: {
      title,
      description,
      tags: tags || [],
      updatedAt: new Date(),
    },
    include: {
      videos: {
        include: { mediaAsset: true },
      },
    },
  });

  const formatted = {
    id: updatedVideoAlbum.id,
    title: updatedVideoAlbum.title,
    description: updatedVideoAlbum.description,
    tags: updatedVideoAlbum.tags,
    videos: (updatedVideoAlbum.videos || []).map((v) => ({
      id: v.id,
      title: v.title,
      url: v.mediaAsset?.url || "",
      thumbnailUrl: v.mediaAsset?.thumbnailUrl || "",
      duration: v.mediaAsset?.duration ? String(v.mediaAsset.duration) : "0",
      status: v.status,
    })),
  };

  try {
    await cacheDel(`tenant:${id}:videos-albums:*`);
    await cacheDel(`admin:videos-albums:*`);
  } catch (e) {}

  return formatResponse(true, formatted, "Video album updated successfully", 200);
});

// DELETE /api/admin/videos-albums/[id]
export const DELETE = withApiHandler(async (_request: Request, context: any) => {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Album ID is required", 400);

  // Find videos in album to clean up media assets
  const videos = await prisma.video.findMany({
    where: { albumId: id },
    select: { id: true, mediaAssetId: true },
  });

  const videoIds = videos.map((v) => v.id);
  const mediaAssetIds = videos.map((v) => v.mediaAssetId).filter(Boolean);

  await prisma.$transaction([
    prisma.video.deleteMany({ where: { id: { in: videoIds } } }),
    prisma.mediaAsset.deleteMany({ where: { id: { in: mediaAssetIds } } }),
    prisma.videoAlbum.delete({ where: { id } }),
  ]);

  try {
    await cacheDel(`tenant:${id}:videos-albums:*`);
    await cacheDel(`admin:videos-albums:*`);
  } catch (e) {}

  return formatResponse(true, null, "Video album deleted successfully", 200);
});
