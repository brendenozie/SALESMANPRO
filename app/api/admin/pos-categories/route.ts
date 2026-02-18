import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/store-categories/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Helper type for subcategories as they are stored in JSON
type SubcategoryJson = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  visible: boolean;
};

// GET /api/store-categories
const getStoreCategories = async (request: Request) => {
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  const whereClause = companyId ? { companyId } : {};

  
    const cacheKey = `admin:pos-categories:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const storeCategories = await prisma.storeCategory.findMany({
    where: whereClause,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          image: true,
          description: true,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  try {
    if (storeCategories) {
      await cacheSet(cacheKey, storeCategories, 60);
    }
  } catch (e) {}

  const response = storeCategories.map((sc) => ({
    id: sc.id,
    companyId: sc.companyId,
    categoryId: sc.categoryId,
    displayName: sc.displayName || sc.category?.name || "Unnamed Category",
    icon: sc.icon || sc.category?.icon || "📦",
    sortOrder: sc.sortOrder,
    visible: sc.visible,
    subcategories: (sc.subcategories as SubcategoryJson[] | null) || [],
    allBrands: sc.allBrands,
    categoryName: sc.category?.name,
    categorySlug: sc.category?.slug,
  }));

  return formatResponse(true, { categories: response }, null, 200);
};

// Export wrapped handler
export const GET = withApiHandler(getStoreCategories);
