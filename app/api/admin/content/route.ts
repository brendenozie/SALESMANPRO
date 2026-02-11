// // app/api/content/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET: Paginated list of content with metadata summaries.
 */
export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  
  // 1. Pagination & Filtering
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
  const skip = (page - 1) * limit;
  const type = searchParams.get("type");

  const where = {
    ...(type && { type }),
  };

  // 2. Fetch data and count in parallel
  const [content, totalItems] = await Promise.all([
    prisma.content.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        publishDate: true,
        // OPTIMIZATION: Get counts or summaries rather than deep lists
        photoAlbum: {
          select: { 
            id: true, 
            title: true, 
            _count: { select: { photos: true } } 
          }
        },
        videoAlbum: {
          select: { 
            id: true, 
            title: true, 
            _count: { select: { videos: true } } 
          }
        },
      },
    }),
    prisma.content.count({ where }),
  ]);

  return formatResponse(true, {
    content,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    }
  });
});

/**
 * POST: Atomic content creation.
 */
export const POST = withApiHandler(async (request: Request, context: any) => {
  const body = await request.json();
  const { title, type, publishDate, authorId, photoAlbumId, videoAlbumId, status } = body;
  const { adminSlug } = context.params;

  // 1. Fast Validation
  if (!title || !type) {
    return formatResponse(false, null, "Title and type are required", 400);
  }

  try {
    // 2. ATOMIC CREATE: Connect company by slug and check user in one go
    const newContent = await prisma.content.create({
      data: {
        title,
        type,
        status,
        publishDate: publishDate ? new Date(publishDate) : null,
        author: { connect: { id: authorId ?? context.user?.id } },
        company: { connect: { slug: adminSlug } },
        // Conditional connects
        ...(photoAlbumId && { photoAlbum: { connect: { id: photoAlbumId } } }),
        ...(videoAlbumId && { videoAlbum: { connect: { id: videoAlbumId } } }),
      },
      include: {
        photoAlbum: { select: { id: true, title: true } },
        videoAlbum: { select: { id: true, title: true } },
      },
    });

    return formatResponse(true, newContent, "Content created successfully", 201);
  } catch (error: any) {
    // P2025: Record to connect not found (Slug or Author)
    if (error.code === 'P2025') {
      return formatResponse(false, null, "Invalid Company or Author reference", 404);
    }
    throw error;
  }
});
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";
// import { NextResponse } from "next/server";

// /**
//  * @route GET /api/content
//  * @description Fetches all content, including related photo and video albums.
//  */

// // --- Type Definitions for the Handlers ---

// type RouteParams = {
//   adminSlug: string;
//   orderId: string;
// };

// type HandlerContext = {
//   params: RouteParams;
//   user?: any; // Replace with your actual User type if defined
// };

// export const GET = withApiHandler(async (request: Request, context: HandlerContext) => {
//   const content = await prisma.content.findMany({
//     include: {
//       photoAlbum: {
//         include: { photos: true },
//       },
//       videoAlbum: {
//         include: { videos: true },
//       },
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   return formatResponse(true, content, null, 200);
// });

// /**
//  * @route POST /api/content
//  * @description Creates a new content item.
//  */
// export const POST = withApiHandler(async (request: Request, context: HandlerContext) => {

//   const company = await prisma.company.findUnique({
//     where: { slug: context.params.adminSlug },
//     select: { id: true },
//   });

//   const companyId = company?.id;

//   if (!companyId) {
//     return NextResponse.json({ message: "Company not found" }, { status: 404 });
//   }

//   const body = await request.json();
//   const { title, type, publishDate, authorId, photoAlbumId, videoAlbumId, status } = body;

//   // Validation
//   if (!title || !type) {
//     return formatResponse(false, null, "Title and type are required", 400);
//   }
//   if (type === "PhotoAlbum" && !photoAlbumId) {
//     return formatResponse(false, null, 'photoAlbumId is required for type "PhotoAlbum"', 400);
//   }
//   if (type === "VideoAlbum" && !videoAlbumId) {
//     return formatResponse(false, null, 'videoAlbumId is required for type "VideoAlbum"', 400);
//   }

//   const newContent = await prisma.content.create({
//     data: {
//       title,
//       type,
//       status,
//       publishDate,
//       authorId: authorId ?? context.user?.id, // fallback to auth user if available
//       photoAlbumId,
//       videoAlbumId,
//       companyId,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     },
//     include: {
//       photoAlbum: true,
//       videoAlbum: true,
//     },
//   });

//   return formatResponse(true, newContent, null, 201);
// });
