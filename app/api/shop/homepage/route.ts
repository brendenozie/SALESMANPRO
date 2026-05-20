// app/api/shop/homepage/route.ts

import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { cacheGet, cacheSet } from "@/lib/cache";


const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Optimization: Pre-calculate headers
const JSON_HEADER = { "Content-Type": "application/json","Cache-Control": "public, s-maxage=60, stale-while-revalidate=300", ...CORS_HEADERS };

export async function GET() {
  try {
    const cacheKey = "shop:homepage";

    const cached = await cacheGet(cacheKey);

    if (cached) {
      return NextResponse.json(cached, {
        headers: JSON_HEADER,
      });
    }

    const [
      categories,
      flashDeals,
      newArrivals,
      discounts,
      featured,
      featuredCategoryProducts,
    ] = await prisma.$transaction([
      prisma.productCategory.findMany({
        take: 12,
        orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          icon: true,
          isFeatured: true,
          allBrands: true,
        },
      }),

      prisma.marketplaceListings.findMany({
        where: {
          isFlashDeal: true,
        },
        take: 12,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          images: true,
          finalPrice: true,
          sellingPrice: true,
        },
      }),

      prisma.marketplaceListings.findMany({
        where: {
          isNewArrival: true,
        },
        take: 12,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          images: true,
          finalPrice: true,
          sellingPrice: true,
        },
      }),

      prisma.marketplaceListings.findMany({
        where: {
          isDiscounted: true,
        },
        take: 12,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          images: true,
          finalPrice: true,
          sellingPrice: true,
        },
      }),

      prisma.marketplaceListings.findMany({
        where: {
          isFeatured: true,
        },
        take: 12,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          images: true,
          finalPrice: true,
          sellingPrice: true,
        },
      }),

      prisma.marketplaceListings.findMany({
        take: 12,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          images: true,
          finalPrice: true,
          sellingPrice: true,
        },
      }),
    ]);

    const response = {
      categories,
      flashDeals,
      newArrivals,
      discounts,
      featured,
      featuredCategoryProducts,
    };

    await cacheSet(cacheKey, response, 300);

    return NextResponse.json(response, {
      headers: JSON_HEADER,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
