// app/api/photo-albums/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

/**
 * @route GET /api/photo-albums
 * @description Fetches all photo albums, optionally filtered by companyId.
 */
const getHandler = async (request: Request) => {
  


  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  const photoAlbums = await prisma.photoAlbum.findMany({
    where: companyId ? { companyId } : {},
    include: {
      photos: true, // Include all photos associated with the album
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(photoAlbums, { status: 200 });
};

/**
 * @route POST /api/photo-albums
 * @description Creates a new photo album and its associated photos.
 */
const postHandler = async (request: Request) => {
  


  const body = await request.json();
  const { title, description, tags, photoUrls, companyId, userId } = body;

  // Validate required fields
  if (!title || !Array.isArray(photoUrls) || photoUrls.length === 0) {
    return NextResponse.json(
      { error: "Title and at least one image URL are required" },
      { status: 400 }
    );
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
          data: photoUrls.map((url: string) => ({ imageUrl: url })),
        },
      },
    },
    include: {
      photos: true,
    },
  });

  return NextResponse.json(newPhotoAlbum, { status: 201 });
};

export const GET = withApiHandler(getHandler);
export const POST = withApiHandler(postHandler);
