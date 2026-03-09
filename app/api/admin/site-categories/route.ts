import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";

export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const cacheKey = `admin:companycategory:all`;
  
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const categories = await prisma.companyCategory.findMany({
    include: {
      variants: {
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  try {
    await cacheSet(cacheKey, categories, 60);
  } catch (e) {}

  return formatResponse(true, categories, "Fetched", 200);
});

export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const { name, icon, variants } = body;

  const category = await prisma.companyCategory.create({
    data: {
      name,
      icon,
      variants: {
        create: variants.map((v: any) => ({
          name: v.name,
          link: v.link,
          description: v.description,
          tag: v.tag,
          desktopPreviewImage: v.desktopPreviewImage,
          mobilePreviewImage: v.mobilePreviewImage,
        }))
      }
    }
  });

  await cacheDel(`admin:companycategory:*`);
  return formatResponse(true, category, "Category Created", 201);
});