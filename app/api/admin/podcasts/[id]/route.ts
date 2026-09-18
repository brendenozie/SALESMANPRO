import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/admin/podcasts/[id]/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Define the type for route parameters
interface PodcastRouteParams {
  params: { id: string };
}

// PUT /api/admin/podcasts/[id]
// Updates an existing podcast
const putHandler = async (
  request: Request,
  { params }: PodcastRouteParams
) => {
  const { id } = params;
  const body = await request.json();

  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };

  // Only allow specific fields
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.audioUrl !== undefined) updateData.audioUrl = body.audioUrl;
  if (body.duration !== undefined)
    updateData.duration = parseInt(body.duration, 10);
  if (body.episodeNumber !== undefined)
    updateData.episodeNumber = parseInt(body.episodeNumber, 10);
  if (body.releaseDate !== undefined)
    updateData.releaseDate = new Date(body.releaseDate);
  if (body.coverImageUrl !== undefined)
    updateData.coverImageUrl = body.coverImageUrl;
  if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
  if (body.isPremium !== undefined) updateData.isPremium = !!body.isPremium;
  if (body.price !== undefined) updateData.price = parseFloat(body.price);
  if (body.currency !== undefined) updateData.currency = body.currency;
  if (body.previewDuration !== undefined)
    updateData.previewDuration = parseInt(body.previewDuration, 10);
  if (body.media !== undefined) updateData.media = body.media;

  // Categories & tags (disconnect/reconnect)
  if (body.categories !== undefined) {
    const catList = Array.isArray(body.categories)
      ? body.categories
      : typeof body.categories === "string"
      ? body.categories.split(",").filter(Boolean)
      : [];
    if (catList.length > 0) {
      updateData.productCategory = {
        connect: { id: catList[0] },
      };
    }
  }
  if (body.tags !== undefined) {
    updateData.tags = {
      set: Array.isArray(body.tags) ? body.tags.map((tagId: string) => ({ id: tagId })) : [],
    };
  }

  try {
    const updatedPodcast = await prisma.podcast.update({
      where: { id },
      data: updateData,
      include: {
        productCategory: {
          include: { StoreCategory: true },
        },
        tags: true,
      },
    });

    try {
      await cacheDel(`tenant:${id}:podcasts:*`);
      await cacheDel(`admin:podcasts:*`);
    } catch (e) {}
    return formatResponse(true, updatedPodcast, null, 200);
  } catch (error: any) {
    console.error("Error updating podcast:", error);
    if (error.code === "P2025") {
      return formatResponse(false, null, "Podcast not found", 404);
    }
    return formatResponse(
      false,
      null,
      `Failed to update podcast: ${error.message}`,
      500
    );
  }
};

// DELETE /api/admin/podcasts/[id]
// Deletes a podcast
const deleteHandler = async (
  request: Request,
  { params }: PodcastRouteParams
) => {
  const { id } = params;

  try {
    await prisma.podcast.delete({
      where: { id },
    });

    try {
      await cacheDel(`tenant:${id}:podcasts:*`);
      await cacheDel(`admin:podcasts:*`);
    } catch (e) {}
    return formatResponse(true, null, null, 204);
  } catch (error: any) {
    console.error("Error deleting podcast:", error);
    if (error.code === "P2025") {
      return formatResponse(false, null, "Podcast not found", 404);
    }
    return formatResponse(
      false,
      null,
      `Failed to delete podcast: ${error.message}`,
      500
    );
  }
};

export const PUT = withApiHandler(putHandler);
export const DELETE = withApiHandler(deleteHandler);
