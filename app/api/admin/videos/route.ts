import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/videos/route.ts
import prisma from "@/server/db/prismadb";
import { VideoStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// GET /api/videos - Fetch all videos
async function handleGET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    
    const cacheKey = `admin:videos:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const videos = await prisma.video.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: "desc" },
    });

  try {
    if (videos) {
      await cacheSet(cacheKey, videos, 60);
    }
  } catch (e) {}

    return formatResponse(true, videos, "Videos fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    return formatResponse(false, null, error.message || "Failed to fetch videos", 500);
  }
}

// POST /api/videos - Create a new video
async function handlePOST(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);

    const body = await request.json();
    const {
      title,
      url,
      thumbnailUrl,
      description,
      duration,
      tags,
      date,
      imageUrl,
      companyId,
      userId,
      status,
    } = body;

    if (!title || !imageUrl) {
      return formatResponse(false, null, "Title and imageUrl are required", 400);
    }

    const newVideo = await prisma.video.create({
      data: {
        title,
        url: url || thumbnailUrl || imageUrl, // ensure fallback
        thumbnailUrl: thumbnailUrl || imageUrl,
        description,
        duration,
        tags: tags || [],
        // date: date ? new Date(date) : new Date(),
        status: status as VideoStatus,
        // thumbnailUrl:imageUrl,
        companyId,
        userId,
      } as any,
    });

    
    try { await cacheDel(`admin:videos:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newVideo, "Video created successfully", 201);
  } catch (error: any) {
    console.error("Error creating video:", error);
    return formatResponse(false, null, error.message || "Failed to create video", 500);
  }
}

// Export wrapped handlers
export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
