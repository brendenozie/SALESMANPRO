import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/store-categories/route.ts

import prisma from "@/server/db/prismadb";
import { v4 as uuidv4 } from "uuid";
import { verifyAuth } from "@/lib/verifyAuth";
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

// --- GET: Fetch all store categories ---
async function getStoreCategories(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    const whereClause = companyId ? { companyId } : {};

    
    const cacheKey = `admin:school-reports:${companyId || 'global'}:all`;

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

    const response = storeCategories.map((sc) => ({
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

    return formatResponse(true, response, "Store categories fetched successfully", 200);
  } catch (error: any) {
    console.error("Error fetching store categories:", error);
    return formatResponse(false, null, "Failed to fetch store categories", 500);
  }
}

// --- POST: Create a new store category ---
async function createStoreCategory(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

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
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true, image: true, description: true },
        },
      },
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

    
    try { await cacheDel(`admin:school-reports:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, responseData, "Store category created successfully", 201);
  } catch (error: any) {
    console.error("Error creating store category:", error);
    if (error.code === "P2002") {
      return formatResponse(false, null, "A category with similar properties might already exist", 409);
    }
    return formatResponse(false, null, "Failed to create store category", 500);
  }
}

// ✅ Export wrapped with withApiHandler
export const GET = withApiHandler(getStoreCategories);
export const POST = withApiHandler(createStoreCategory);
