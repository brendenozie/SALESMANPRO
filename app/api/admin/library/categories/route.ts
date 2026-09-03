import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/library/categories
// Fetches all categories filtered by companyId with book counts
const getCategoriesLogic = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required.", 400);
  }

  const cacheKey = buildTenantCacheKey(companyId, "libraryCategories", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const categories = await prisma.libraryCategory.findMany({
    where: { companyId },
    include: {
      _count: {
        select: { libraryBooks: true }
      }
    },
    orderBy: { name: "asc" },
  });

  try {
    if (categories) {
      await cacheSet(cacheKey, categories, 60);
    }
  } catch (e) {}

  return formatResponse(true, categories, "Categories retrieved successfully", 200);
};

export const GET = withApiHandler(getCategoriesLogic, { requireAuth: true, requireRateLimit: true });

// POST /api/admin/library/categories
// Creates a new library category
const postCategoryLogic = async (request: Request) => {
  const body = await request.json();
  const { name, companyId } = body;

  if (!name || !companyId) {
    return formatResponse(false, null, "Category name and company ID are required.", 400);
  }

  // Check for duplicate name within the same company
  const existingCategory = await prisma.libraryCategory.findFirst({
    where: { 
      name: { equals: name, mode: 'insensitive' },
      companyId 
    },
  });

  if (existingCategory) {
    return formatResponse(false, null, "A category with this name already exists.", 409);
  }

  const newCategory = await prisma.libraryCategory.create({
    data: {
      name,
      companyId,
    },
  });
  
  // Invalidate relevant caches
  try {
    await cacheDel(`tenant:${companyId}:libraryCategories:*`);
    await cacheDel(`admin:libraryCategories:*`);
  } catch (e) {}

  return formatResponse(true, newCategory, "Category created successfully", 201);
};

export const POST = withApiHandler(postCategoryLogic, { requireAuth: true, requireRateLimit: true });