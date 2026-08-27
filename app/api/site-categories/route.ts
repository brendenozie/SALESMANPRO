import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet } from "@/lib/cache";

export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const nameQuery = searchParams.get("name"); // Optional: Filter by industry name

  const cacheKey = nameQuery 
    ? `public:categories:search:${nameQuery}` 
    : `public:categories:all`;

  // 1. Check Cache
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Data retrieved (cached)", 200);
  } catch (e) {
    console.error("Cache read error:", e);
  }

  // 2. Database Fetch with Strict Filters
  const categories = await prisma.companyCategory.findMany({
    where: {
      status: "active", // Only show active industries
      ...(nameQuery && { name: { contains: nameQuery, mode: 'insensitive' } })
    },
    include: {
      variants: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          link: true,
          description: true,
          tag: true,
          desktopPreviewImage: true,
          mobilePreviewImage: true
          // Exclude internal timestamps if not needed to save bandwidth
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  // 3. Set Cache (Longer TTL for public data - 5 minutes)
  try {
    await cacheSet(cacheKey, categories, 300);
  } catch (e) {
    console.error("Cache set error:", e);
  }

  return formatResponse(true, categories, "Fetched active categories", 200);
});