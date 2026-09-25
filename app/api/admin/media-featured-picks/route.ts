import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withApiHandler(async (request: Request, context: any) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.companyId;

  if (!companyId) {
    return formatResponse(false, null, "companyId is required", 400);
  }

  const cacheKey = buildTenantCacheKey(companyId, "featured-picks", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  // Fetch blogs, videos, and albums for this company
  const [blogs, videos, contentItems] = await Promise.all([
    prisma.blog.findMany({
      where: { companyId },
      select: {
        id: true,
        title: true,
        isFeature: true,
        coverImage: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.video.findMany({
      where: { companyId },
      include: { mediaAsset: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.content.findMany({
      where: { companyId },
      select: {
        id: true,
        title: true,
        type: true,
        published: true,
        thumbnailUrl: true,
        createdAt: true,
      },
    }),
  ]);

  const items: any[] = [];

  blogs.forEach((b) => {
    items.push({
      id: b.id,
      title: b.title,
      type: "Article",
      imageUrl: b.coverImage || "",
      isFeatured: Boolean(b.isFeature),
      companyId,
      status: b.status,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    });
  });

  videos.forEach((v) => {
    items.push({
      id: v.id,
      title: v.title || "Video",
      type: "Video",
      imageUrl: v.mediaAsset?.thumbnailUrl || v.mediaAsset?.url || "",
      isFeatured: v.tags?.includes("featured") || false,
      companyId,
      status: v.status,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    });
  });

  try {
    await cacheSet(cacheKey, items, 30);
  } catch (e) {}

  return formatResponse(true, items, "Featured picks fetched successfully", 200);
});

export const POST = withApiHandler(async (request: Request, context: any) => {
  const body = await request.json();
  const { id, type, isFeatured, companyId: explicitCompanyId } = body;
  const companyId = explicitCompanyId || context.companyId;

  if (!id) {
    return formatResponse(false, null, "Item id is required", 400);
  }

  if (type === "Article") {
    await prisma.blog.update({
      where: { id },
      data: { isFeature: Boolean(isFeatured), updatedAt: new Date() },
    });
  } else if (type === "Video") {
    const video = await prisma.video.findUnique({ where: { id } });
    if (video) {
      let tags = video.tags || [];
      if (isFeatured && !tags.includes("featured")) {
        tags.push("featured");
      } else if (!isFeatured) {
        tags = tags.filter((t) => t !== "featured");
      }
      await prisma.video.update({
        where: { id },
        data: { tags, updatedAt: new Date() },
      });
    }
  }

  try {
    if (companyId) {
      await cacheDel(`tenant:${companyId}:featured-picks:*`);
      await cacheDel(`tenant:${companyId}:blogs:*`);
    }
    await cacheDel(`admin:featured-picks:*`);
  } catch (e) {}

  return formatResponse(true, { id, isFeatured }, "Featured status updated successfully", 200);
});
