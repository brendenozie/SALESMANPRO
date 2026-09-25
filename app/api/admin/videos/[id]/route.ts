import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { VideoStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/videos/:id
async function handleGET(request: Request, context: any) {
  try {
    const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
    const id = resolvedParams?.id;

    if (!id) return formatResponse(false, null, "Video ID is required", 400);

    const cacheKey = buildTenantCacheKey(id, "videos", {});

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    const video = await prisma.video.findUnique({
      where: { id },
      include: { mediaAsset: true },
    });

    if (!video) {
      return formatResponse(false, null, "Video not found", 404);
    }

    const formatted = {
      id: video.id,
      title: video.title,
      description: video.description,
      url: video.mediaAsset?.url || "",
      thumbnailUrl: video.mediaAsset?.thumbnailUrl || "",
      duration: video.mediaAsset?.duration ? String(video.mediaAsset.duration) : "0",
      tags: video.tags,
      status: video.status,
      views: video.views,
      albumId: video.albumId,
      companyId: video.companyId,
    };

    try {
      await cacheSet(cacheKey, formatted, 60);
    } catch (e) {}

    return formatResponse(true, formatted, "Video fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching video:", error);
    return formatResponse(false, null, error.message || "Failed to fetch video", 500);
  }
}

// PUT /api/admin/videos/:id
async function handlePUT(request: Request, context: any) {
  try {
    const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
    const id = resolvedParams?.id;

    if (!id) return formatResponse(false, null, "Video ID is required", 400);

    const body = await request.json();
    const { title, url, thumbnailUrl, description, duration, tags, status, companyId } = body;

    const existing = await prisma.video.findUnique({
      where: { id },
      include: { mediaAsset: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Video not found", 404);
    }

    if ((url || thumbnailUrl || duration) && existing.mediaAssetId) {
      await prisma.mediaAsset.update({
        where: { id: existing.mediaAssetId },
        data: {
          ...(url ? { url } : {}),
          ...(thumbnailUrl ? { thumbnailUrl } : {}),
          ...(duration ? { duration: parseFloat(duration) } : {}),
          updatedAt: new Date(),
        },
      });
    }

    const updatedVideo = await prisma.video.update({
      where: { id },
      data: {
        title,
        description,
        tags: tags || existing.tags,
        ...(status ? { status: status as VideoStatus } : {}),
        updatedAt: new Date(),
      },
      include: { mediaAsset: true },
    });

    const formatted = {
      id: updatedVideo.id,
      title: updatedVideo.title,
      description: updatedVideo.description,
      url: updatedVideo.mediaAsset?.url || url || "",
      thumbnailUrl: updatedVideo.mediaAsset?.thumbnailUrl || thumbnailUrl || "",
      duration: updatedVideo.mediaAsset?.duration ? String(updatedVideo.mediaAsset.duration) : "0",
      status: updatedVideo.status,
      tags: updatedVideo.tags,
    };

    try {
      if (companyId || existing.companyId) {
        await cacheDel(`tenant:${companyId || existing.companyId}:videos:*`);
      }
      await cacheDel(`admin:videos:*`);
    } catch (e) {}

    return formatResponse(true, formatted, "Video updated successfully", 200);
  } catch (error: any) {
    console.error("Error updating video:", error);
    return formatResponse(false, null, error.message || "Failed to update video", 500);
  }
}

// DELETE /api/admin/videos/:id
async function handleDELETE(request: Request, context: any) {
  try {
    const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
    const id = resolvedParams?.id;

    if (!id) return formatResponse(false, null, "Video ID is required", 400);

    const existing = await prisma.video.findUnique({
      where: { id },
      select: { id: true, mediaAssetId: true, companyId: true },
    });

    if (!existing) {
      return formatResponse(false, null, "Video not found", 404);
    }

    await prisma.$transaction([
      prisma.video.delete({ where: { id } }),
      ...(existing.mediaAssetId
        ? [prisma.mediaAsset.delete({ where: { id: existing.mediaAssetId } })]
        : []),
    ]);

    try {
      if (existing.companyId) {
        await cacheDel(`tenant:${existing.companyId}:videos:*`);
      }
      await cacheDel(`admin:videos:*`);
    } catch (e) {}

    return formatResponse(true, null, "Video deleted successfully", 200);
  } catch (error: any) {
    console.error(`Error deleting video:`, error);
    if ((error as any).code === "P2025") {
      return formatResponse(false, null, "Video not found", 404);
    }
    return formatResponse(false, null, error.message || "Failed to delete video", 500);
  }
}

export const GET = withApiHandler(handleGET);
export const PUT = withApiHandler(handlePUT);
export const DELETE = withApiHandler(handleDELETE);
