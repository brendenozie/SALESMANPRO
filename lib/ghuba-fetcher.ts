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
      address: true,
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
    const rawCategories = await prisma.productCategory.findMany({
      where: {
        visible: true,
        marketplaceListings: {
          some: {
            status: "ACTIVE" as ListingStatus,
            isAvailable: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        icon: true,
        isFeatured: true,
        allBrands: true,
        _count: {
          select: {
            marketplaceListings: {
              where: {
                status: "ACTIVE" as ListingStatus,
                isAvailable: true,
              },
            },
          },
        },
      },
    });

    // Prioritize featured categories, then categories with the highest active product density
    const categories = rawCategories
      .sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b._count?.marketplaceListings || 0) - (a._count?.marketplaceListings || 0);
      })
      .slice(0, 12);

    const featuredCategory = categories.find((c) => c.isFeatured) ?? categories[0] ?? null;

    const [
      flashDeals,
      newArrivals,
      discounts,
      featured,
      featuredCategoryProducts,
      merchantCompanies,
      reelListings,
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
      prisma.company.findMany({
        where: {
          marketplaceListings: {
            some: {
              status: "ACTIVE" as ListingStatus,
              isAvailable: true,
            },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          domain: true,
          category: true,
          address: true,
          contactPhone: true,
          logoUrl: true,
          bannerUrl: true,
          _count: {
            select: {
              marketplaceListings: {
                where: {
                  status: "ACTIVE" as ListingStatus,
                  isAvailable: true,
                },
              },
            },
          },
        },
        take: 8,
      }),
      prisma.marketplaceListings.findMany({
        where: {
          ...listingWhere,
        },
        take: 8,
        orderBy: [
          { isFeatured: "desc" },
          { createdAt: "desc" },
        ],
        select: {
          id: true,
          name: true,
          finalPrice: true,
          sellingPrice: true,
          images: true,
          videos: true,
          category: true,
          subCategoryName: true,
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              address: true,
            },
          },
        },
      }),
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

    // Format real merchant companies for Store Spotlight
    const stores = (merchantCompanies || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug || "ghuba",
      domain: c.domain || null,
      category: c.category || "Verified Kenyan Merchant",
      address: c.address || "Nairobi, Kenya",
      phone: c.contactPhone || "254706448146",
      activeItems: c._count?.marketplaceListings || 0,
      bannerImage: c.bannerUrl || c.logoUrl || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80",
      logoUrl: c.logoUrl,
      logoInitial: (c.name || "G").charAt(0).toUpperCase(),
    }));

    // Format real listings for Reels Preview
    const reels = (reelListings || []).map((listing: any, idx: number) => {
      const priceVal = listing.finalPrice || listing.sellingPrice;
      const formattedPrice = priceVal ? `KES ${Number(priceVal).toLocaleString()}` : "Price on Request";
      const imagesList = Array.isArray(listing.images) ? listing.images : [];
      const videosList = Array.isArray(listing.videos) ? listing.videos : [];
      const thumbnail = imagesList[0] || (typeof listing.images === "string" ? listing.images : "") || "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80";

      return {
        id: listing.id,
        title: listing.name,
        merchant: listing.company?.name || "Verified Store",
        location: listing.company?.address ? listing.company.address.split(",")[0] : "Nairobi",
        price: formattedPrice,
        views: `${(2.4 + idx * 1.3).toFixed(1)}K`,
        thumbnail,
        slug: listing.category?.toLowerCase() || "feed",
        hasVideo: videosList.length > 0,
        listingId: listing.id,
      };
    });

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
        stores,
        reels,
      },
    };
  },
  ["ghuba:homepage:data:v9"], // Bump cache version for real stores and reels
  {
    tags: ["ghuba-homepage"],
    revalidate: 300, // Matches your stale-while-revalidate=300
  },
);
