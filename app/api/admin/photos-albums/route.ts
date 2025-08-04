// app/api/photo-albums/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';

/**
 * @route GET /api/photo-albums
 * @description Fetches all photo albums, optionally filtered by companyId.
 * @returns {Response} A JSON response containing an array of photo albums.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const photoAlbums = await prisma.photoAlbum.findMany({
      where: companyId ? { companyId } : {},
      include: {
        photos: true, // Include all photos associated with the album
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(photoAlbums, { status: 200 });
  } catch (error) {
    console.error('Error fetching photo albums:', error);
    return NextResponse.json({ error: 'Failed to fetch photo albums' }, { status: 500 });
  }
}

/**
 * @route POST /api/photo-albums
 * @description Creates a new photo album and its associated photos.
 * @returns {Response} A JSON response containing the newly created photo album.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      tags,
      photoUrls, // Expects an array of image URLs
      companyId,
      userId,
    } = body;

    // Validate that required fields are present
    if (!title || !photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0) {
      return NextResponse.json({ error: 'Title and at least one image URL are required' }, { status: 400 });
    }

    const newPhotoAlbum = await prisma.photoAlbum.create({
      data: {
        title,
        description,
        tags: tags || [],
        companyId,
        userId,
        photos: {
          createMany: {
            data: photoUrls.map((url) => ({ imageUrl: url })),
          },
        },
      },
      include: {
        photos: true,
      },
    });

    return NextResponse.json(newPhotoAlbum, { status: 201 });
  } catch (error) {
    console.error('Error creating photo album:', error);
    return NextResponse.json({ error: 'Failed to create photo album' }, { status: 500 });
  }
}
