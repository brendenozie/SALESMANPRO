// app/api/admin/podcasts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

import prisma from "@/server/db/prismadb"; 

// Define the type for route parameters
interface PodcastRouteParams {
  params: { id: string }; // 'id' corresponds to the [id] dynamic segment
}

// PUT /api/admin/podcasts/[id]
// Updates an existing podcast
export async function PUT(request: NextRequest, { params }: PodcastRouteParams) {
  try {
    const { id } = params; // Get the podcast ID from the URL
    const body = await request.json();

    // Prepare data for update, ensuring only allowed fields are updated
    const updateData: Record<string, any> = {
      updatedAt: new Date(), // Always update the timestamp
    };

    // Dynamically add fields to updateData if they exist in the request body
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.audioUrl !== undefined) updateData.audioUrl = body.audioUrl;
    if (body.duration !== undefined) updateData.duration = parseInt(body.duration, 10);
    if (body.episodeNumber !== undefined) updateData.episodeNumber = parseInt(body.episodeNumber, 10);
    if (body.releaseDate !== undefined) updateData.releaseDate = new Date(body.releaseDate);
    if (body.coverImageUrl !== undefined) updateData.coverImageUrl = body.coverImageUrl;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    // Note: creatorId, creatorType, podcastId are typically not updated after creation

    // Handle categories and tags connection/disconnection
    if (body.categories !== undefined) {
      updateData.categories = {
        set: body.categories.map((catId: string) => ({ id: catId })), // Disconnect all and reconnect selected
      };
    }
    if (body.tags !== undefined) {
      updateData.tags = {
        set: body.tags.map((tagId: string) => ({ id: tagId })), // Disconnect all and reconnect selected
      };
    }

    const updatedPodcast = await prisma.podcast.update({
      where: { id: id },
      data: updateData,
      include: { // Optionally include connected categories/tags in the response
        productCategory: {
          include:{
            StoreCategory:true
          }
        },
        tags: true,
      },
    });

    return NextResponse.json(updatedPodcast, { status: 200 });

  } catch (error: any) {
    console.error('Error updating podcast:', error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json(
        { message: 'Podcast not found.' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to update podcast', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/podcasts/[id]
// Deletes a podcast
export async function DELETE(request: NextRequest, { params }: PodcastRouteParams) {
  try {
    const { id } = params; // Get the podcast ID from the URL

    await prisma.podcast.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 }); // No content on successful deletion

  } catch (error: any) {
    console.error('Error deleting podcast:', error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json(
        { message: 'Podcast not found.' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to delete podcast', error: error.message },
      { status: 500 }
    );
  }
}