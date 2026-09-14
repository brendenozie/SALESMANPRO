"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGhubaHomepageCached = exports.isGhubaMarketplace = void 0;
const cache_1 = require("next/cache");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
var ghuba_helpers_1 = require("./ghuba-helpers");
Object.defineProperty(exports, "isGhubaMarketplace", { enumerable: true, get: function () { return ghuba_helpers_1.isGhubaMarketplace; } });
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
    status: "ACTIVE",
    isAvailable: true,
    ghubaAdminApproved: true,
    ghubaStatus: "APPROVED",
};
exports.getGhubaHomepageCached = (0, cache_1.unstable_cache)(async () => {
    const categories = await prismadb_1.default.productCategory.findMany({
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
    const [flashDeals, newArrivals, discounts, featured, featuredCategoryProducts,] = await Promise.all([
        prismadb_1.default.marketplaceListings.findMany({
            where: { ...listingWhere, isFlashDeal: true },
            take: 12,
            orderBy: { createdAt: "desc" },
            select: listingSelect,
        }),
        prismadb_1.default.marketplaceListings.findMany({
            where: { ...listingWhere, isNewArrival: true },
            take: 12,
            orderBy: { createdAt: "desc" },
            select: listingSelect,
        }),
        prismadb_1.default.marketplaceListings.findMany({
            where: { ...listingWhere, isDiscounted: true },
            take: 12,
            orderBy: { createdAt: "desc" },
            select: listingSelect,
        }),
        prismadb_1.default.marketplaceListings.findMany({
            where: { ...listingWhere, isFeatured: true },
            take: 12,
            orderBy: { createdAt: "desc" },
            select: listingSelect,
        }),
        featuredCategory
            ? prismadb_1.default.marketplaceListings.findMany({
                where: { ...listingWhere, productCategoryId: featuredCategory.id },
                take: 12,
                orderBy: { createdAt: "desc" },
                select: listingSelect,
            })
            : Promise.resolve([]),
    ]);
    // Query active sponsored listing campaigns for Ghuba homepage top placements
    let sponsoredListings = [];
    try {
        const activeSponsoredCampaigns = await prismadb_1.default.adCampaign.findMany({
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
            .filter((id) => Boolean(id));
        if (sponsoredListingIds.length > 0) {
            const rawSponsored = await prismadb_1.default.marketplaceListings.findMany({
                where: { id: { in: sponsoredListingIds }, ...listingWhere },
                select: listingSelect,
            });
            sponsoredListings = rawSponsored.map((l) => ({
                ...l,
                isSponsored: true,
            }));
        }
    }
    catch {
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
}, ["ghuba:homepage:data:v4"], // Updated cache key with company relation
{
    tags: ["ghuba-homepage"],
    revalidate: 300, // Matches your stale-while-revalidate=300
});
