import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { ContentStatus, ContentType } from "@prisma/client";

export const GET = withApiHandler(async (_req, context: any) => {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Content ID is required", 400);

  const cacheKey = buildTenantCacheKey(id, "content", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const content = await prisma.content.findUnique({
    where: { id },
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
  });

  if (!content) {
    return formatResponse(false, null, "Content not found", 404);
  }

  const formatted = {
    id: content.id,
    title: content.title,
    description: content.description,
    excerpt: content.excerpt,
    type: content.type,
    contentType: content.contentType,
    status: content.status,
    publishDate: content.publishDate,
    published: content.published,
    contentUrl: content.contentUrl,
    thumbnailUrl: content.thumbnailUrl,
    category: content.category,
    duration: content.duration,
    tags: content.tags,
    companyId: content.companyId,
    photoAlbum: content.photoAlbum
      ? {
          id: content.photoAlbum.id,
          title: content.photoAlbum.title,
          photos: content.photoAlbum.photos.map((p) => ({
            id: p.id,
            imageUrl: p.mediaAsset?.url || "",
            title: p.title,
          })),
        }
      : null,
    videoAlbum: content.videoAlbum
      ? {
          id: content.videoAlbum.id,
          title: content.videoAlbum.title,
          videos: content.videoAlbum.videos.map((v) => ({
            id: v.id,
            title: v.title,
            url: v.mediaAsset?.url || "",
            thumbnailUrl: v.mediaAsset?.thumbnailUrl || "",
          })),
        }
      : null,
    author: content.author,
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  };

  try {
    await cacheSet(cacheKey, formatted, 60);
  } catch (e) {}

  return formatResponse(true, formatted, "Content fetched successfully", 200);
});

export const PUT = withApiHandler(async (request, context: any) => {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Content ID is required", 400);

  const body = await request.json();
  const {
    title,
    description,
    excerpt,
    type,
    contentType,
    status,
    publishDate,
    published,
    category,
    duration,
    tags,
    contentUrl,
    thumbnailUrl,
    photoAlbumId,
    videoAlbumId,
  } = body;

  try {
    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(contentType !== undefined ? { contentType: contentType as ContentType } : {}),
        ...(status !== undefined ? { status: status as ContentStatus } : {}),
        ...(publishDate !== undefined ? { publishDate: publishDate ? new Date(publishDate) : null } : {}),
        ...(published !== undefined ? { published: Boolean(published) } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(duration !== undefined ? { duration: duration ? parseFloat(duration) : null } : {}),
        ...(tags !== undefined ? { tags: Array.isArray(tags) ? tags : [] } : {}),
        ...(contentUrl !== undefined ? { contentUrl } : {}),
        ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {}),
        ...(photoAlbumId !== undefined ? { photoAlbumId } : {}),
        ...(videoAlbumId !== undefined ? { videoAlbumId } : {}),
        updatedAt: new Date(),
      },
    });

    try {
      if (updatedContent.companyId) {
        await cacheDel(`tenant:${updatedContent.companyId}:content:*`);
      }
      await cacheDel(`admin:content:*`);
      await cacheDel(`tenant:${id}:content:*`);
    } catch (e) {}

    return formatResponse(true, updatedContent, "Content updated successfully", 200);
  } catch (error: any) {
    console.error(`[content/PUT] Error updating content ${id}:`, error);
    return formatResponse(false, null, error.message || "Failed to update content", 500);
  }
});

export const DELETE = withApiHandler(async (_request, context: any) => {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const id = resolvedParams?.id;

  if (!id) return formatResponse(false, null, "Content ID is required", 400);

  try {
    const existing = await prisma.content.findUnique({
      where: { id },
      select: { companyId: true },
    });

    await prisma.content.delete({
      where: { id },
    });

    try {
      if (existing?.companyId) {
        await cacheDel(`tenant:${existing.companyId}:content:*`);
      }
      await cacheDel(`admin:content:*`);
      await cacheDel(`tenant:${id}:content:*`);
    } catch (e) {}

    return formatResponse(true, null, "Content deleted successfully", 200);
  } catch (error: any) {
    console.error(`[content/DELETE] Error deleting content ${id}:`, error);
    return formatResponse(false, null, error.message || "Failed to delete content", 500);
  }
});
