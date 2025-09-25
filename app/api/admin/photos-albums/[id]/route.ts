// app/api/photo-albums/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

/**
 * @route GET /api/photo-albums/:id
 * @description Fetches a single photo album by ID.
 * @returns {Response} A JSON response containing the specified photo album.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    const photoAlbum = await prisma.photoAlbum.findUnique({
      where: { id },
      include: {
        photos: true, // Include all photos in the album
      },
    });

    if (!photoAlbum) {
      return NextResponse.json({ error: 'Photo album not found' }, { status: 404 });
    }

    return NextResponse.json(photoAlbum, { status: 200 });
  } catch (error) {
    console.error(`Error fetching photo album with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch photo album' }, { status: 500 });
  }
}

/**
 * @route PUT /api/photo-albums/:id
 * @description Updates an existing photo album's metadata.
 * @returns {Response} A JSON response containing the updated photo album.
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    const body = await request.json();
    const { title, description, tags } = body;

    const updatedPhotoAlbum = await prisma.photoAlbum.update({
      where: { id },
      data: {
        title,
        description,
        tags,
        updatedAt: new Date(),
      },
      include: {
        photos: true,
      },
    });

    return NextResponse.json(updatedPhotoAlbum, { status: 200 });
  } catch (error) {
    // if (error.code === 'P2025') {
    //   return NextResponse.json({ error: 'Photo album not found' }, { status: 404 });
    // }
    console.error(`Error updating photo album with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to update photo album' }, { status: 500 });
  }
}

/**
 * @route DELETE /api/photo-albums/:id
 * @description Deletes a photo album and all its associated photos.
 * @returns {Response} A 204 No Content response.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  try {
    await prisma.$transaction([
      prisma.photo.deleteMany({ where: { albumId: id } }),
      prisma.photoAlbum.delete({ where: { id } }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // if (error.code === 'P2025') {
    //   return NextResponse.json({ error: 'Photo album not found' }, { status: 404 });
    // }
    console.error(`Error deleting photo album with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to delete photo album' }, { status: 500 });
  }
}
