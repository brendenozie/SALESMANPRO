"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGhubaHomepageCached = void 0;
const cache_1 = require("next/cache");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
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
}, ["ghuba:homepage:data:v2"], // Stable cache key
{
    tags: ["ghuba-homepage"],
    revalidate: 300, // Matches your stale-while-revalidate=300
});
