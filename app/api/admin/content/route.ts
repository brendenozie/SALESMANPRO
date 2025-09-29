// app/api/content/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { NextResponse } from "next/server";

/**
 * @route GET /api/content
 * @description Fetches all content, including related photo and video albums.
 */

// --- Type Definitions for the Handlers ---

type RouteParams = {
  adminSlug: string;
  orderId: string;
};

type HandlerContext = {
  params: RouteParams;
  user?: any; // Replace with your actual User type if defined
};

export const GET = withApiHandler(async (request: Request, context: HandlerContext) => {
  const content = await prisma.content.findMany({
    include: {
      photoAlbum: {
        include: { photos: true },
      },
      videoAlbum: {
        include: { videos: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return formatResponse(true, content, null, 200);
});

/**
 * @route POST /api/content
 * @description Creates a new content item.
 */
export const POST = withApiHandler(async (request: Request, context: HandlerContext) => {

  const company = await prisma.company.findUnique({
    where: { slug: context.params.adminSlug },
    select: { id: true },
  });

  const companyId = company?.id;

  if (!companyId) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title, type, publishDate, authorId, photoAlbumId, videoAlbumId, status } = body;

  // Validation
  if (!title || !type) {
    return formatResponse(false, null, "Title and type are required", 400);
  }
  if (type === "PhotoAlbum" && !photoAlbumId) {
    return formatResponse(false, null, 'photoAlbumId is required for type "PhotoAlbum"', 400);
  }
  if (type === "VideoAlbum" && !videoAlbumId) {
    return formatResponse(false, null, 'videoAlbumId is required for type "VideoAlbum"', 400);
  }

  const newContent = await prisma.content.create({
    data: {
      title,
      type,
      status,
      publishDate,
      authorId: authorId ?? context.user?.id, // fallback to auth user if available
      photoAlbumId,
      videoAlbumId,
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    include: {
      photoAlbum: true,
      videoAlbum: true,
    },
  });

  return formatResponse(true, newContent, null, 201);
});
