import { unstable_cache } from "next/cache";
import prisma from "@/server/db/prismadb";
import { ListingStatus } from "@prisma/client";

const listingSelect = {
  id: true,
  name: true,
  images: true,
  finalPrice: true,
  sellingPrice: true,
  discount: true,
  isFeatured: true,
  isFlashDeal: true,
  isDiscounted: true,
  isNewArrival: true,
  brand: true,
  productCategoryId: true,
};

const listingWhere = {
  status: "ACTIVE" as ListingStatus,
  isAvailable: true,
  ghubaAdminApproved: true,
  ghubaStatus: "APPROVED",
};

export const getGhubaHomepageCached = unstable_cache(
  async () => {
    const categories = await prisma.productCategory.findMany({
      where: { visible: true },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
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

    const [
      flashDeals,
      newArrivals,
      discounts,
      featured,
      featuredCategoryProducts,
    ] = await Promise.all([
      prisma.marketplaceListings.findMany({
        where: { ...listingWhere, isFlashDeal: true },
        take: 12,
        orderBy: { createdAt: "desc" },
        select: listingSelect,
      }),
      prisma.marketplaceListings.findMany({
        where: { ...listingWhere, isNewArrival: true },
        take: 12,
        orderBy: { createdAt: "desc" },
        select: listingSelect,
      }),
      prisma.marketplaceListings.findMany({
        where: { ...listingWhere, isDiscounted: true },
        take: 12,
        orderBy: { createdAt: "desc" },
        select: listingSelect,
      }),
      prisma.marketplaceListings.findMany({
        where: { ...listingWhere, isFeatured: true },
        take: 12,
        orderBy: { createdAt: "desc" },
        select: listingSelect,
      }),
      featuredCategory
        ? prisma.marketplaceListings.findMany({
            where: { ...listingWhere, productCategoryId: featuredCategory.id },
            take: 12,
            orderBy: { createdAt: "desc" },
            select: listingSelect,
          })
        : Promise.resolve([]),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      categories,
      featuredCategory,
      sections: {
        featured,
        flashDeals,
        newArrivals,
        discounts,
        featuredCategoryProducts,
      },
    };
  },
  ["ghuba:homepage:data:v2"], // Stable cache key
  {
    tags: ["ghuba-homepage"],
    revalidate: 300, // Matches your stale-while-revalidate=300
  },
);
