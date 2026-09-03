import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/photo-albums/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// 
const getHandler = async (request: Request) => {
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  const cacheKey = buildTenantCacheKey(companyId, "photos-albums", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const photoAlbums = await prisma.photoAlbum.findMany({
    where: companyId ? { companyId } : {},
    include: {
      photos: true, // Include all photos associated with the album
    },
    orderBy: { createdAt: "desc" },
  });

  try {
    if (photoAlbums) {
      await cacheSet(cacheKey, photoAlbums, 60);
    }
  } catch (e) {}

  return NextResponse.json(photoAlbums, { status: 200 });
};

// 
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

    try {
      await cacheDel(`tenant:${companyId}:photos-albums:*`);
      await cacheDel(`admin:photos-albums:*`);
    } catch (e) {}
    return NextResponse.json(newPhotoAlbum, { status: 201 });
};

export const GET = withApiHandler(getHandler);
export const POST = withApiHandler(postHandler);
