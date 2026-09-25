import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { ContentType, ContentStatus } from "@prisma/client";

export const GET = withApiHandler(async (request: Request, context: any) => {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const skip = (page - 1) * limit;
  const type = searchParams.get("type");
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  // Accept companyId or companyID or context.companyId
  const companyId =
    searchParams.get("companyId") ||
    searchParams.get("companyID") ||
    context.companyId;

  const where: any = {
    ...(companyId ? { companyId } : {}),
    ...(type ? { type } : {}),
    ...(status ? { status: status as ContentStatus } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const cacheKey = buildTenantCacheKey(companyId, "content", { limit, page, type, search, status });

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const [contentList, totalItems] = await Promise.all([
    prisma.content.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        photoAlbum: {
          include: {
            photos: {
              include: { mediaAsset: true },
            },
          },
        },
        videoAlbum: {
          include: {
            videos: {
              include: { mediaAsset: true },
            },
          },
        },
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    }),
    prisma.content.count({ where }),
  ]);

  const formatted = contentList.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    excerpt: item.excerpt,
    type: item.type,
    contentType: item.contentType,
    status: item.status,
    publishDate: item.publishDate,
    published: item.published,
    contentUrl: item.contentUrl,
    thumbnailUrl:
      item.thumbnailUrl ||
      item.videoAlbum?.videos?.[0]?.mediaAsset?.thumbnailUrl ||
      item.photoAlbum?.photos?.[0]?.mediaAsset?.url ||
      "",
    category: item.category,
    duration: item.duration,
    tags: item.tags,
    companyId: item.companyId,
    photoAlbumId: item.photoAlbumId,
    photoAlbum: item.photoAlbum
      ? {
          id: item.photoAlbum.id,
          title: item.photoAlbum.title,
          photos: item.photoAlbum.photos.map((p) => ({
            id: p.id,
            imageUrl: p.mediaAsset?.url || "",
            title: p.title,
          })),
        }
      : null,
    videoAlbumId: item.videoAlbumId,
    videoAlbum: item.videoAlbum
      ? {
          id: item.videoAlbum.id,
          title: item.videoAlbum.title,
          videos: item.videoAlbum.videos.map((v) => ({
            id: v.id,
            title: v.title,
            url: v.mediaAsset?.url || "",
            thumbnailUrl: v.mediaAsset?.thumbnailUrl || "",
          })),
        }
      : null,
    author: item.author,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  const payload = {
    items: formatted,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    page,
    limit,
  };

  try {
    await cacheSet(cacheKey, payload, 60);
  } catch (e) {}

  return formatResponse(true, payload, "Content fetched successfully", 200);
});

export const POST = withApiHandler(async (request: Request, context: any) => {
  const body = await request.json();
  const {
    title,
    description,
    excerpt,
    type,
    contentType = "VIDEO",
    status = "Draft",
    publishDate,
    photoAlbumId,
    videoAlbumId,
    category,
    duration,
    tags = [],
    contentUrl,
    thumbnailUrl,
    published = false,
  } = body;

  const companyId = body.companyId || context.companyId;

  if (!title) {
    return formatResponse(false, null, "Title is required", 400);
  }

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required", 400);
  }

  const newContent = await prisma.content.create({
    data: {
      title,
      description: description || null,
      excerpt: excerpt || null,
      type: type || (videoAlbumId ? "VideoAlbum" : photoAlbumId ? "PhotoAlbum" : "Article"),
      contentType: contentType as ContentType,
      status: (status as ContentStatus) || "Draft",
      publishDate: publishDate ? new Date(publishDate) : null,
      published: Boolean(published),
      category: category || null,
      duration: duration ? parseFloat(duration) : null,
      tags: Array.isArray(tags) ? tags : [],
      contentUrl: contentUrl || null,
      thumbnailUrl: thumbnailUrl || null,
      companyId,
      authorId: context.user?.id || null,
      photoAlbumId: photoAlbumId || null,
      videoAlbumId: videoAlbumId || null,
    },
    include: {
      photoAlbum: true,
      videoAlbum: true,
    },
  });

  try {
    await cacheDel(`tenant:${companyId}:content:*`);
    await cacheDel(`admin:content:*`);
  } catch (e) {}

  return formatResponse(true, newContent, "Content created successfully", 201);
});
