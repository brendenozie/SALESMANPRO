import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { VideoStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { dispatchVideoTranscode } from "@/lib/media/transcoding/dispatcher";

// GET /api/admin/videos - Fetch all videos
async function handleGET(request: Request, context: any) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || context.companyId;

    const cacheKey = buildTenantCacheKey(companyId, "videos", {});

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {}

    const videos = await prisma.video.findMany({
      where: companyId ? { companyId } : {},
      include: { mediaAsset: true, album: true },
      orderBy: { createdAt: "desc" },
    });

    const formatted = videos.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description || "",
      url: v.mediaAsset?.url || "",
      thumbnailUrl: v.mediaAsset?.thumbnailUrl || "",
      duration: v.mediaAsset?.duration ? String(v.mediaAsset.duration) : "0",
      status: v.status,
      views: v.views,
      tags: v.tags,
      albumId: v.albumId,
      albumTitle: v.album?.title,
      companyId: v.companyId,
      createdAt: v.createdAt,
    }));

    try {
      if (formatted) {
        await cacheSet(cacheKey, formatted, 60);
      }
    } catch (e) {}

    return formatResponse(true, formatted, "Videos fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    return formatResponse(false, null, error.message || "Failed to fetch videos", 500);
  }
}

// POST /api/admin/videos - Create a new video
async function handlePOST(request: Request, context: any) {
  try {
    const body = await request.json();
    const {
      title,
      url,
      thumbnailUrl,
      description,
      duration,
      tags,
      companyId: explicitCompanyId,
      userId,
      status,
      albumId,
    } = body;
    const companyId = explicitCompanyId || context.companyId;

    if (!title || (!url && !thumbnailUrl)) {
      return formatResponse(false, null, "Title and video URL are required", 400);
    }

    // Ensure video album exists
    let targetAlbumId = albumId;
    if (!targetAlbumId) {
      // Find or create a default album for this company
      let defaultAlbum = await prisma.videoAlbum.findFirst({
        where: companyId ? { companyId } : {},
      });
      if (!defaultAlbum) {
        defaultAlbum = await prisma.videoAlbum.create({
          data: {
            title: "Default Video Album",
            companyId: companyId || null,
            userId: userId || null,
            tags: ["default"],
          },
        });
      }
      targetAlbumId = defaultAlbum.id;
    }

    // Create underlying MediaAsset
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        type: "VIDEO",
        source: "UPLOAD",
        status: "READY",
        url: url || thumbnailUrl,
        thumbnailUrl: thumbnailUrl || url,
        duration: duration ? parseFloat(duration) : undefined,
        companyId: companyId || null,
        ownerId: userId || null,
        approvalStatus: "APPROVED",
      },
    });

    const newVideo = await prisma.video.create({
      data: {
        title,
        description: description || null,
        mediaAssetId: mediaAsset.id,
        albumId: targetAlbumId,
        tags: tags || [],
        status: (status as VideoStatus) || "DRAFT",
        companyId: companyId || null,
        userId: userId || null,
      },
      include: {
        mediaAsset: true,
      },
    });

    // Enqueue background multi-bitrate HLS transcoding without blocking HTTP response
    if (url && (url.includes(".mp4") || url.includes(".webm") || url.includes(".mov"))) {
      dispatchVideoTranscode({
        mediaAssetId: mediaAsset.id,
        companyId: companyId || "default",
        sourceUrl: url,
      }).catch((e: any) => console.warn("[VIDEO TRANSCODE DISPATCH WARNING]", e.message));
    }

    const formatted = {
      id: newVideo.id,
      title: newVideo.title,
      description: newVideo.description,
      url: newVideo.mediaAsset?.url || url,
      thumbnailUrl: newVideo.mediaAsset?.thumbnailUrl || thumbnailUrl,
      duration: newVideo.mediaAsset?.duration ? String(newVideo.mediaAsset.duration) : "0",
      status: newVideo.status,
      tags: newVideo.tags,
      albumId: newVideo.albumId,
      companyId: newVideo.companyId,
    };

    try {
      if (companyId) {
        await cacheDel(`tenant:${companyId}:videos:*`);
      }
      await cacheDel(`admin:videos:*`);
    } catch (e) {}

    return formatResponse(true, formatted, "Video created successfully", 201);
  } catch (error: any) {
    console.error("Error creating video:", error);
    return formatResponse(false, null, error.message || "Failed to create video", 500);
  }
}

export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
