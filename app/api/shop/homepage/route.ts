import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { fetchWithCache } from "@/lib/cache";
import { ListingStatus } from "@prisma/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const JSON_HEADER = {
  "Content-Type": "application/json",
  "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
  ...CORS_HEADERS,
};

const listingSelect = {
  discount: true,
  isFeatured: true,
  isFlashDeal: true,
  isDiscounted: true,
  isNewArrival: true,
  category: true,
  subCategoryName: true,
  brand: true,
  productCategoryId: true,
  id: true,
  sellingPrice: true,
  finalPrice: true,
  createdAt: true,
  name: true,
  images: true,
  isAvailable: true,
  isOnOffer: true,
  option: true,
  product: {
    select: {
      id: true,
    },
  },
};

const listingWhere = {
  status: "ACTIVE" as ListingStatus,
  isAvailable: true,
  ghubaAdminApproved: true,
  ghubaStatus: "APPROVED",
};

async function getHandler() {
  try {
    const cacheKey = "shop:homepage:v3";

    const response = await fetchWithCache(
      cacheKey,
      async () => {
        // 1. Categories
        const categories = await prisma.productCategory.findMany({
          where: {
            visible: true,
          },
          orderBy: [
            { isFeatured: "desc" },
            { sortOrder: "asc" },
            { name: "asc" },
          ],
          take: 12,
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            icon: true,
            isFeatured: true,
            allBrands: true,
          },
        });

        const featuredCategory = categories.find((c) => c.isFeatured) ?? null;

        // 2. Sections in Parallel
        const [
          flashDeals,
          newArrivals,
          discounts,
          featured,
          featuredCategoryProducts,
        ] = await Promise.all([
          prisma.marketplaceListings.findMany({
            where: {
              ...listingWhere,
              isFlashDeal: true,
            },
            take: 12,
            orderBy: { createdAt: "desc" },
            select: listingSelect,
          }),
          prisma.marketplaceListings.findMany({
            where: {
              ...listingWhere,
              isNewArrival: true,
            },
            take: 12,
            orderBy: { createdAt: "desc" },
            select: listingSelect,
          }),
          prisma.marketplaceListings.findMany({
            where: {
              ...listingWhere,
              isDiscounted: true,
            },
            take: 12,
            orderBy: { createdAt: "desc" },
            select: listingSelect,
          }),
          prisma.marketplaceListings.findMany({
            where: {
              ...listingWhere,
              isFeatured: true,
            },
            take: 12,
            orderBy: { createdAt: "desc" },
            select: listingSelect,
          }),
          featuredCategory
            ? prisma.marketplaceListings.findMany({
                where: {
                  ...listingWhere,
                  productCategoryId: featuredCategory.id,
                },
                take: 12,
                orderBy: { createdAt: "desc" },
                select: listingSelect,
              })
            : Promise.resolve([]),
        ]);

        return {
          categories,
          flashDeals,
          newArrivals,
          discounts,
          featured,
          featuredCategoryProducts,
        };
      },
      { ttlSeconds: 180, swrSeconds: 300 }, // 3 min TTL, 5 min SWR
    );

    return NextResponse.json(response, {
      headers: JSON_HEADER,
    });
  } catch (error) {
    console.error("Homepage API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load homepage." },
      { status: 500 },
    );
  }
}

export const GET = withApiHandler(getHandler, {
  requireAuth: false,
  requireRateLimit: true,
});
