import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// // app/api/content/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  
  // 1. Pagination & Filtering
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
  const skip = (page - 1) * limit;
  const type = searchParams.get("type");
  const companyID = searchParams.get("companyID");

  const where = {
    ...(type && { type }),
    ...(companyID && { companyId: companyID }),
  };

  // 2. Fetch data and count in parallel
  
  const cacheKey = buildTenantCacheKey(companyID, "content", { limit, page, type });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
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

  try {
    if (content) {
      await cacheSet(cacheKey, {
        content,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
        }
      }, 60);
    }
  } catch (e) {}

  return formatResponse(true, {
    content,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    }
  });
});


export const POST = withApiHandler(async (request: Request, context: any) => {
  const body = await request.json();
  const { title, type, publishDate, authorId, photoAlbumId, videoAlbumId, status } = body;
  const { adminSlug } = context.params;
  const cacheKey = buildTenantCacheKey(adminSlug, "content", { status, type });

  // Validation
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

    // Clear cache for all content of this type
    try { await cacheDel(cacheKey); } catch (e) {}
    return formatResponse(true, newContent, "Content created successfully", 201);
  } catch (error: any) {
    // P2025: Record to connect not found (Slug or Author)
    if (error.code === 'P2025') {
      return formatResponse(false, null, "Invalid Company or Author reference", 404);
    }
    throw error;
  }
});


//   return formatResponse(true, content, null, 200);
// });

// 
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
