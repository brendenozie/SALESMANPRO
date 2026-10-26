import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { cacheGet, cacheSet } from "@/lib/cache";

export const dynamic = "force-dynamic";

const CACHE_KEY = "ghuba:store-categories:all";
const CACHE_TTL_SECONDS = 300; // 5 minutes

export async function GET() {
  try {
    // 1. Try cache first
    try {
      const cached = await cacheGet(CACHE_KEY);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return NextResponse.json({ success: true, categories: cached, cached: true });
      }
    } catch (cacheErr) {
      // Cache failure is non-fatal
    }

    // 2. Fetch from CompanyCategory (Active)
    const companyCategories = await prisma.companyCategory.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        icon: true,
      },
      orderBy: { name: "asc" },
    });

    // 3. Fetch from ProductCategory
    const productCategories = await prisma.productCategory.findMany({
      where: {
        OR: [
          { visible: true },
          { status: "Active" },
          { status: "active" },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    });

    // 4. Combine into clean deduplicated category list
    const categoryMap = new Map<string, { id: string; name: string; icon?: string | null }>();

    // Priority 1: companyCategories
    companyCategories.forEach((cc) => {
      const trimmed = cc.name?.trim();
      if (trimmed) {
        categoryMap.set(trimmed.toLowerCase(), {
          id: cc.id,
          name: trimmed,
          icon: cc.icon || null,
        });
      }
    });

    // Priority 2: productCategories
    productCategories.forEach((pc) => {
      const trimmed = pc.name?.trim();
      if (trimmed && !categoryMap.has(trimmed.toLowerCase())) {
        categoryMap.set(trimmed.toLowerCase(), {
          id: pc.id,
          name: trimmed,
          icon: null,
        });
      }
    });

    // Fallback if database has no seeded categories yet
    const FALLBACK_CATEGORIES = [
      "Fashion & Apparel",
      "Shoes & Footwear",
      "Electronics & Gadgets",
      "Beauty & Cosmetics",
      "Home Decor & Furniture",
      "Food, Snacks & Groceries",
      "Automotive & Motor Accessories",
      "Baby & Kids Essentials",
      "Art, Crafts & Gifts",
      "General Merchandise",
    ];

    if (categoryMap.size === 0) {
      FALLBACK_CATEGORIES.forEach((cat, index) => {
        categoryMap.set(cat.toLowerCase(), {
          id: `fallback-${index}`,
          name: cat,
          icon: null,
        });
      });
    }

    const categories = Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Save to cache
    try {
      await cacheSet(CACHE_KEY, categories, CACHE_TTL_SECONDS);
    } catch {}

    return NextResponse.json({
      success: true,
      categories,
      count: categories.length,
    });
  } catch (error: any) {
    console.error("[Ghuba Categories API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load store categories",
        categories: [
          { id: "1", name: "Fashion & Apparel" },
          { id: "2", name: "Shoes & Footwear" },
          { id: "3", name: "Electronics & Gadgets" },
          { id: "4", name: "Beauty & Cosmetics" },
          { id: "5", name: "Home Decor & Furniture" },
          { id: "6", name: "Food, Snacks & Groceries" },
          { id: "7", name: "Automotive & Motor Accessories" },
          { id: "8", name: "Baby & Kids Essentials" },
          { id: "9", name: "Art, Crafts & Gifts" },
          { id: "10", name: "General Merchandise" },
        ],
      },
      { status: 200 }
    );
  }
}
