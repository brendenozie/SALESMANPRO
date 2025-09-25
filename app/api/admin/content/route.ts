// app/api/photos/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { request } from 'http';

// GET /api/photos - Fetch all photos
// app/api/content/route.ts

/**
 * @route GET /api/content
 * @description Fetches all content, including related photo and video albums.
 * @returns {Response} A JSON response containing an array of content items.
 */
export async function GET() {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const content = await prisma.content.findMany({
      include: {
        photoAlbum: {
          include: {
            photos: true,
          },
        },
        videoAlbum: {
          include: {
            videos: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

/**
 * @route POST /api/content
 * @description Creates a new content item.
 * @returns {Response} A JSON response with the created content item.
 */
export async function POST(request: Request) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const body = await request.json();
    const { title, type, publishDate, authorId, photoAlbumId, videoAlbumId, status } = body;

    // Basic validation
    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    // Ensure only one album ID is provided if the type is for an album
    if (type === 'PhotoAlbum' && !photoAlbumId) {
      return NextResponse.json({ error: 'photoAlbumId is required for type "PhotoAlbum"' }, { status: 400 });
    }
    if (type === 'VideoAlbum' && !videoAlbumId) {
      return NextResponse.json({ error: 'videoAlbumId is required for type "VideoAlbum"' }, { status: 400 });
    }

    const newContent = await prisma.content.create({
      data: {
        title,
        type,
        status,
        publishDate,
        authorId,
        photoAlbumId,
        videoAlbumId,
      },
      include: {
        photoAlbum: true,
        videoAlbum: true,
      },
    });

    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}
