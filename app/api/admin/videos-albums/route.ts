import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { VideoStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/videos-albums
export const GET = withApiHandler(async (request: Request, context: any) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.companyId;

  const cacheKey = buildTenantCacheKey(companyId, "videos-albums", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const videoAlbums = await prisma.videoAlbum.findMany({
    where: companyId ? { companyId } : {},
    include: {
      videos: {
        include: { mediaAsset: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedAlbums = videoAlbums.map((album) => ({
    id: album.id,
    title: album.title,
    description: album.description || "",
    tags: album.tags || [],
    companyId: album.companyId,
    userId: album.userId,
    createdAt: album.createdAt,
    updatedAt: album.updatedAt,
    videos: (album.videos || []).map((v) => ({
      id: v.id,
      title: v.title || album.title,
      description: v.description || "",
      url: v.mediaAsset?.url || "",
      thumbnailUrl: v.mediaAsset?.thumbnailUrl || "",
      duration: v.mediaAsset?.duration ? String(v.mediaAsset.duration) : "0",
      status: v.status || "READY",
      views: v.views || 0,
    })),
  }));

  try {
    if (formattedAlbums) {
      await cacheSet(cacheKey, formattedAlbums, 60);
    }
  } catch (e) {}

  return formatResponse(true, formattedAlbums, "Video albums fetched successfully", 200);
});

// POST /api/admin/videos-albums
export const POST = withApiHandler(async (request: Request, context: any) => {
  const body = await request.json();
  const { title, description, tags, videoDetails, userId } = body;
  const companyId = body.companyId || context.companyId;

  if (!title) {
    return formatResponse(false, null, "Title is required", 400);
  }

  // 1. Create VideoAlbum
  const newAlbum = await prisma.videoAlbum.create({
    data: {
      title,
      description: description || null,
      tags: tags || [],
      companyId: companyId || null,
      userId: userId || null,
    },
  });

  // 2. Create Videos with MediaAssets if details provided
  const createdVideos = [];
  if (Array.isArray(videoDetails) && videoDetails.length > 0) {
    for (const detail of videoDetails) {
      const mediaAsset = await prisma.mediaAsset.create({
        data: {
          type: "VIDEO",
          source: "UPLOAD",
          status: "READY",
          url: detail.url || "",
          thumbnailUrl: detail.thumbnailUrl || "",
          duration: detail.duration ? parseFloat(detail.duration) : undefined,
          companyId: companyId || null,
          ownerId: userId || null,
          approvalStatus: "APPROVED",
        },
      });

      const video = await prisma.video.create({
        data: {
          mediaAssetId: mediaAsset.id,
          albumId: newAlbum.id,
          title: detail.title || title,
          description: detail.description || description || null,
          status: (detail.status as VideoStatus) || "DRAFT",
          tags: tags || [],
          companyId: companyId || null,
          userId: userId || null,
        },
        include: {
          mediaAsset: true,
        },
      });

      createdVideos.push({
        id: video.id,
        title: video.title,
        url: video.mediaAsset?.url || detail.url,
        thumbnailUrl: video.mediaAsset?.thumbnailUrl || detail.thumbnailUrl,
        duration: detail.duration || "0",
        status: video.status,
      });
    }
  }

  const result = {
    id: newAlbum.id,
    title: newAlbum.title,
    description: newAlbum.description || "",
    tags: newAlbum.tags,
    companyId: newAlbum.companyId,
    videos: createdVideos,
  };

  try {
    if (companyId) {
      await cacheDel(`tenant:${companyId}:videos-albums:*`);
    }
    await cacheDel(`admin:videos-albums:*`);
  } catch (e) {}

  return formatResponse(true, result, "Video album created successfully", 201);
});
