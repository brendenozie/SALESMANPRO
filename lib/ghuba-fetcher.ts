import { unstable_cache } from "next/cache";
import prisma from "@/server/db/prismadb";
import { ListingStatus } from "@prisma/client";
export { isGhubaMarketplace } from "./ghuba-helpers";

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
  category: true,
  subCategoryName: true,
  subCategory: true,
  productCategory: {
    select: {
      id: true,
      name: true,
    },
  },
  make: true,
  model: true,
  vin: true,
  bedrooms: true,
  duration: true,
  companyId: true,
  company: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
    },
  },
};

const listingWhere = {
  status: "ACTIVE" as ListingStatus,
  isAvailable: true,
  AND: [
    {
      OR: [
        { ghubaAdminApproved: true },
        { ghubaAdminApproved: null },
        { ghubaAdminApproved: { isSet: false } },
      ],
    },
    {
      OR: [
        { ghubaStatus: "APPROVED" },
        { ghubaStatus: null },
        { ghubaStatus: { isSet: false } },
      ],
    },
  ],
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

    // Query active sponsored listing campaigns for Ghuba homepage top placements
    let sponsoredListings: any[] = [];
    try {
      const activeSponsoredCampaigns = await prisma.adCampaign.findMany({
        where: {
          status: "ACTIVE",
          listingId: { not: null },
        },
        select: {
          id: true,
          listingId: true,
          bidAmountKES: true,
        },
        orderBy: { bidAmountKES: "desc" },
        take: 6,
      });

      const sponsoredListingIds = activeSponsoredCampaigns
        .map((c) => c.listingId)
        .filter((id): id is string => Boolean(id));

      if (sponsoredListingIds.length > 0) {
        const rawSponsored = await prisma.marketplaceListings.findMany({
          where: { id: { in: sponsoredListingIds }, ...listingWhere },
          select: listingSelect,
        });
        sponsoredListings = rawSponsored.map((l) => ({
          ...l,
          isSponsored: true,
        }));
      }
    } catch {
      // Fallback gracefully if ad tables are being seeded
    }

    return {
      generatedAt: new Date().toISOString(),
      categories,
      featuredCategory,
      sections: {
        sponsored: sponsoredListings,
        featured,
        flashDeals,
        newArrivals,
        discounts,
        featuredCategoryProducts,
      },
    };
  },
  ["ghuba:homepage:data:v5"], // Updated cache key to refresh homepage data with approved listings
  {
    tags: ["ghuba-homepage"],
    revalidate: 300, // Matches your stale-while-revalidate=300
  },
);
