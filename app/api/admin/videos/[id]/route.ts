import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/videos/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { VideoStatus } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// GET /api/videos/:id
async function handleGET(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);

    
    const cacheKey = buildTenantCacheKey('global', "videos", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const video = await prisma.video.findUnique({
      where: { id: params.id },
    });

  try {
    if (video) {
      await cacheSet(cacheKey, video, 60);
    }
  } catch (e) {}

    if (!video) {
      return formatResponse(false, null, "Video not found", 404);
    }

    try{ await cacheDel(`admin:videos:${'global' || 'global'}:*`); } catch (e) {
      console.error("Error deleting cached videos:", e);
    }
    return formatResponse(true, video, "Video fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching video:", error);
    return formatResponse(false, null, error.message || "Failed to fetch video", 500);
  }
}

// PUT /api/videos/:id
async function handlePUT(request: Request, { params }: { params: { id: string } }) {
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
      status,
      imageUrl,
      companyId,
      userId,
    } = body;

    const updatedVideo = await prisma.video.update({
      where: { id: params.id },
      data: {
        title,
        url,
        thumbnailUrl,
        description,
        duration,
        tags,
        status: status as VideoStatus,
        // imageUrl,
        companyId,
        userId,
      },
    });

    
    try {
      await cacheDel(`tenant:${companyId}:videos:*`);
      await cacheDel(`admin:videos:*`);
    } catch (e) {}
    return formatResponse(true, updatedVideo, "Video updated successfully", 200);
  } catch (error: any) {
    console.error("Error updating video:", error);
    return formatResponse(false, null, error.message || "Failed to update video", 500);
  }
}

// DELETE /api/videos/:id
async function handleDELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);

    const { id } = params;

    await prisma.video.delete({ where: { id } });

    
    try {
      await cacheDel(`tenant:${'global'}:videos:*`);
      await cacheDel(`admin:videos:*`);
    } catch (e) {}
    return formatResponse(true, null, "Video deleted successfully", 204);
  } catch (error: any) {
    console.error(`Error deleting video with ID ${params.id}:`, error);

    // Prisma "Record not found" error (optional handling)
    if ((error as any).code === "P2025") {
      return formatResponse(false, null, "Video not found", 404);
    }

    return formatResponse(false, null, error.message || "Failed to delete video", 500);
  }
}

// Export wrapped handlers
export const GET = withApiHandler(handleGET);
export const PUT = withApiHandler(handlePUT);
export const DELETE = withApiHandler(handleDELETE);
