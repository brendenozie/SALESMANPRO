// app/api/admin/podcasts/[id]/route.ts
import { NextRequest } from "next/server";
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
  request: NextRequest,
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

  // Categories & tags (disconnect/reconnect)
  if (body.categories !== undefined) {
    updateData.categories = {
      set: body.categories.map((catId: string) => ({ id: catId })),
    };
  }
  if (body.tags !== undefined) {
    updateData.tags = {
      set: body.tags.map((tagId: string) => ({ id: tagId })),
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
  request: NextRequest,
  { params }: PodcastRouteParams
) => {
  const { id } = params;

  try {
    await prisma.podcast.delete({
      where: { id },
    });

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
