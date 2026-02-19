import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/product-categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET: List all categories for a company
export const GET = withApiHandler(async (request: Request, context: any) => {
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "companyId is required", 400);
  }

  const cacheKey = `admin:product-categories:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const categories = await prisma.productCategory.findMany({
    where: { companyId },
    orderBy: { sortOrder: "asc" },
  });

  try {
    if (categories) {
      await cacheSet(cacheKey, categories, 60);
    }
  } catch (e) {}

  return formatResponse(true, categories, "Categories fetched successfully");
});

// POST: Create a new product category
export const POST = withApiHandler(async (request: Request) => {
  
  const data = await request.json();

  const {
    name,
    icon,
    image,
    slug,
    description,
    longDescription,
    seoTitle,
    seoDescription,
    metaKeywords,
    sortOrder,
    visible,
    createdBy,
    updatedBy,
    status,
    allBrands,
    tags,
    subcategories,
    imageAlt,
    thumbnail,
    bannerImage,
    localization,
    productCount,
    isFeatured,
    showInHomepage,
    attributes,
    companyId,
  } = data;

  if (!name || !slug) {
    return formatResponse(false, null, "Name and slug are required", 400);
  }

  const category = await prisma.productCategory.create({
    data: {
      name,
      icon,
      image,
      slug,
      description,
      longDescription,
      seoTitle,
      seoDescription,
      metaKeywords,
      sortOrder,
      visible,
      createdBy,
      updatedBy,
      status,
      allBrands,
      tags,
      subcategories,
      imageAlt,
      thumbnail,
      bannerImage,
      localization,
      productCount,
      isFeatured,
      showInHomepage,
      attributes,
      companyId,
    },
  });

    try { await cacheDel(`admin:product-categories:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, category, "Category created successfully", 201);
});
