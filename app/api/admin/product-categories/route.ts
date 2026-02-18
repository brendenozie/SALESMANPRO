import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/product-categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET: List all categories for a company
export const GET = withApiHandler(async (request: Request, context: any) => {
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ message: "companyId is required" }, { status: 400 });
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

  return NextResponse.json(categories);
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
    return NextResponse.json({ message: "Name and slug are required" }, { status: 400 });
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
    return NextResponse.json(category, { status: 201 });
});
