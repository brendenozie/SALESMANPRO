import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/store-categories/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Helper type for subcategories
type SubcategoryJson = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  visible: boolean;
};

// GET - Fetch all store categories, optionally filtered by companyId
async function getStoreCategories(req: Request) {

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    const whereClause = companyId ? { companyId } : {};
    
    const cacheKey = `admin:store-categories:${companyId || 'global'}:all`;

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
      orderBy: { sortOrder: "asc" },
    });

  try {
    if (storeCategories) {
      await cacheSet(cacheKey, storeCategories, 60);
    }
  } catch (e) {}

    const response = storeCategories.map(sc => ({
      id: sc.id,
      companyId: sc.companyId,
      categoryId: sc.categoryId,
      displayName: sc.displayName || sc.category?.name || "Unnamed Category",
      icon: sc.icon || sc.category?.icon || "📦",
      sortOrder: sc.sortOrder,
      visible: sc.visible,
      items: (sc.subcategories as SubcategoryJson[] | null) || [],
      allBrands: sc.allBrands,
      categoryName: sc.category?.name,
      categorySlug: sc.category?.slug,
    }));

    return formatResponse(true, response, "Store categories fetched successfully");
  } catch (err: any) {
    console.error("Error fetching store categories:", err);
    return formatResponse(false, null, err.message || "Failed to fetch store categories", 500);
  }
}

// POST - Create a new store category
async function postStoreCategory(req: Request) {
  
  try {
    const body = await req.json();
    const { companyId, categoryId, displayName, icon, sortOrder, visible } = body;

    if (!companyId || !categoryId || !displayName) {
      return formatResponse(false, null, "Company ID, Category ID, and Display Name are required", 400);
    }

    const existingStoreCategory = await prisma.storeCategory.findUnique({
      where: { companyId_categoryId: { companyId, categoryId } },
    });

    if (existingStoreCategory) {
      return formatResponse(false, null, "A store category for this company and product category already exists", 409);
    }

    const newStoreCategory = await prisma.storeCategory.create({
      data: {
        companyId,
        categoryId,
        displayName,
        icon,
        sortOrder: sortOrder ?? 0,
        visible: visible ?? true,
        subcategories: [],
        allBrands: [],
      },
      include: { category: { select: { id: true, name: true, slug: true, icon: true, image: true, description: true } } },
    });

    const responseData = {
      id: newStoreCategory.id,
      companyId: newStoreCategory.companyId,
      categoryId: newStoreCategory.categoryId,
      displayName: newStoreCategory.displayName || newStoreCategory.category?.name || "Unnamed Category",
      icon: newStoreCategory.icon || newStoreCategory.category?.icon || "📦",
      sortOrder: newStoreCategory.sortOrder,
      visible: newStoreCategory.visible,
      items: (newStoreCategory.subcategories as SubcategoryJson[] | null) || [],
      allBrands: newStoreCategory.allBrands,
      categoryName: newStoreCategory.category?.name,
      categorySlug: newStoreCategory.category?.slug,
    };

    
    try { await cacheDel(`admin:store-categories:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, responseData, "Store category created successfully", 201);
  } catch (err: any) {
    console.error("Error creating store category:", err);
    if (err.code === "P2002") {
      return formatResponse(false, null, "A category with similar properties might already exist", 409);
    }
    return formatResponse(false, null, err.message || "Failed to create store category", 500);
  }
}

// DELETE - Delete a store category by ID
async function deleteStoreCategory(req: Request) {
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return formatResponse(false, null, "Store category ID is required", 400);

    const existingStoreCategory = await prisma.storeCategory.findUnique({ where: { id } });
    if (!existingStoreCategory) return formatResponse(false, null, "Store category not found", 404);

    await prisma.storeCategory.delete({ where: { id } });
    
    try { await cacheDel(`admin:store-categories:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Store category deleted successfully");
  } catch (err: any) {
    console.error("Error deleting store category:", err);
    return formatResponse(false, null, err.message || "Failed to delete store category", 500);
  }
}

// Export wrapped handlers
export const GET = withApiHandler(getStoreCategories);
export const POST = withApiHandler(postStoreCategory);
export const DELETE = withApiHandler(deleteStoreCategory);
