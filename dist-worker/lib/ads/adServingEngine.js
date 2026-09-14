"use strict";
/**
 * lib/ads/adServingEngine.ts
 *
 * Central Ad Serving & Contextual Targeting Engine.
 * Matches ad placements across Ghuba, SalesmanPro, and Storefronts with
 * active, funded, and approved ad campaigns.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdServingEngine = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const types_1 = require("./types");
const ghuba_slug_1 = require("@/lib/ghuba-slug");
class AdServingEngine {
    /**
     * Seed standard placements if not already registered in database.
     */
    static async ensureStandardPlacements() {
        const standardPlacements = [
            {
                code: "GHUBA_HOMEPAGE_HERO",
                name: "Ghuba Marketplace Homepage Hero Slider",
                platform: "GHUBA",
                pageType: "HOMEPAGE",
                allowedCreativeTypes: ["IMAGE", "VIDEO"],
                baseCpmKES: 75.0,
                baseCpcKES: 10.0,
            },
            {
                code: "GHUBA_SEARCH_SPONSORED",
                name: "Ghuba Search Top Sponsored Listings",
                platform: "GHUBA",
                pageType: "SEARCH",
                allowedCreativeTypes: ["NATIVE_LISTING", "IMAGE"],
                baseCpmKES: 50.0,
                baseCpcKES: 5.0,
            },
            {
                code: "GHUBA_CATEGORY_TOP",
                name: "Ghuba Category Page Top Banner & Sponsored Row",
                platform: "GHUBA",
                pageType: "CATEGORY",
                allowedCreativeTypes: ["NATIVE_LISTING", "IMAGE", "BANNER"],
                baseCpmKES: 45.0,
                baseCpcKES: 4.5,
            },
            {
                code: "GHUBA_LISTING_RECOMMENDED",
                name: "Ghuba Listing Detail Page Recommended Sponsored Products",
                platform: "GHUBA",
                pageType: "PRODUCT_DETAIL",
                allowedCreativeTypes: ["NATIVE_LISTING", "CAROUSEL"],
                baseCpmKES: 35.0,
                baseCpcKES: 3.5,
            },
            {
                code: "SALESMANPRO_PUBLIC_BANNER",
                name: "SalesmanPro Public Marketing & Feature Banner",
                platform: "SALESMANPRO",
                pageType: "PUBLIC",
                allowedCreativeTypes: ["IMAGE", "VIDEO"],
                baseCpmKES: 60.0,
                baseCpcKES: 8.0,
            },
            {
                code: "STOREFRONT_HERO",
                name: "Merchant Storefront Top Promo Banner",
                platform: "STOREFRONT",
                pageType: "STORE_HOMEPAGE",
                allowedCreativeTypes: ["IMAGE"],
                baseCpmKES: 25.0,
                baseCpcKES: 2.0,
            },
            {
                code: "STOREFRONT_OFFERS",
                name: "Merchant Storefront Featured Offers Banner",
                platform: "STOREFRONT",
                pageType: "STORE_OFFERS",
                allowedCreativeTypes: ["IMAGE", "TEXT"],
                baseCpmKES: 20.0,
                baseCpcKES: 1.5,
            },
        ];
        for (const p of standardPlacements) {
            const existing = await prismadb_1.default.adPlacement.findUnique({
                where: { code: p.code },
            });
            if (!existing) {
                await prismadb_1.default.adPlacement.create({ data: p });
            }
        }
    }
    /**
     * Serve contextual ads matching a specific placement code and search/location intent.
     */
    static async serveAds(request) {
        const { placementCode, category, location, searchQuery, limit = 5 } = request;
        const now = new Date();
        // 1. Fetch placement specifications
        let placement = await prismadb_1.default.adPlacement.findUnique({
            where: { code: placementCode },
        });
        if (!placement) {
            await this.ensureStandardPlacements();
            placement = await prismadb_1.default.adPlacement.findUnique({
                where: { code: placementCode },
            });
            if (!placement)
                return [];
        }
        if (placement.status !== "ACTIVE")
            return [];
        // 2. Query candidate active campaigns
        const campaigns = await prismadb_1.default.adCampaign.findMany({
            where: {
                status: types_1.AdCampaignStatus.ACTIVE,
            },
            include: {
                creatives: {
                    where: { status: "ACTIVE" },
                    take: 3,
                },
            },
            orderBy: { bidAmountKES: "desc" },
            take: limit * 4, // Fetch pool to score contextually
        });
        if (!campaigns || campaigns.length === 0)
            return [];
        // 3. Filter by dates, budget and score by contextual relevance
        const scoredList = [];
        for (const c of campaigns) {
            // Date boundary check
            if (c.startDate && new Date(c.startDate) > now)
                continue;
            if (c.endDate && new Date(c.endDate) < now)
                continue;
            // Budget check
            const remaining = (c.totalBudgetKES || 0) - (c.spentAmountKES || 0);
            if (c.totalBudgetKES > 0 && remaining <= 0) {
                continue;
            }
            let score = 10; // Baseline score
            // Bid weight
            score += Math.min(50, (c.bidAmountKES || 5) * 2);
            const rules = c.targetingRules || {};
            // Category matching
            if (category && rules.categories && Array.isArray(rules.categories)) {
                const matchesCategory = rules.categories.some((cat) => cat.toLowerCase() === category.toLowerCase());
                if (matchesCategory)
                    score += 40;
            }
            // Location matching
            if (location && rules.locations && Array.isArray(rules.locations)) {
                const matchesLocation = rules.locations.some((loc) => loc.toLowerCase() === location.toLowerCase());
                if (matchesLocation)
                    score += 30;
            }
            // Search keyword matching
            if (searchQuery && rules.keywords && Array.isArray(rules.keywords)) {
                const tokens = searchQuery.toLowerCase().split(/\s+/);
                const matchesKeyword = rules.keywords.some((kw) => tokens.some((t) => kw.toLowerCase().includes(t) || t.includes(kw.toLowerCase())));
                if (matchesKeyword)
                    score += 50;
            }
            scoredList.push({ campaign: c, score });
        }
        // Sort descending by score
        scoredList.sort((a, b) => b.score - a.score);
        const selectedCampaigns = scoredList.slice(0, limit).map((s) => s.campaign);
        // 4. Transform into ServedAdItems with listing / product enrichment
        const servedItems = [];
        for (const c of selectedCampaigns) {
            const creative = c.creatives?.[0] || null;
            // Calculate unit cost for impression
            let costPerImpressionKES = 0;
            if (c.biddingStrategy === types_1.AdBiddingStrategy.CPM) {
                costPerImpressionKES = (c.bidAmountKES || placement.baseCpmKES) / 1000;
            }
            const toStringArray = (val) => {
                if (!Array.isArray(val))
                    return [];
                return val
                    .map((item) => {
                    if (typeof item === "string")
                        return item;
                    if (item && typeof item === "object")
                        return item.url || item.secure_url || item.src || "";
                    return "";
                })
                    .filter((url) => Boolean(url));
            };
            let listingData = undefined;
            if (c.listingId) {
                try {
                    const listing = await prismadb_1.default.marketplaceListings.findUnique({
                        where: { id: c.listingId },
                        select: {
                            id: true,
                            name: true,
                            sellingPrice: true,
                            finalPrice: true,
                            images: true,
                            isFeatured: true,
                        },
                    });
                    if (listing) {
                        listingData = {
                            id: listing.id,
                            name: listing.name,
                            sellingPrice: listing.sellingPrice,
                            finalPrice: listing.finalPrice ?? 0,
                            images: toStringArray(listing.images),
                            isFeatured: Boolean(listing.isFeatured),
                        };
                    }
                }
                catch {
                    // Ignore lookup failure
                }
            }
            let productData = undefined;
            if (c.productId) {
                try {
                    const prod = await prismadb_1.default.product.findUnique({
                        where: { id: c.productId },
                        select: { id: true, name: true, sellingPrice: true, images: true },
                    });
                    if (prod) {
                        productData = {
                            id: prod.id,
                            name: prod.name,
                            sellingPrice: prod.sellingPrice,
                            images: toStringArray(prod.images),
                        };
                    }
                }
                catch {
                    // Ignore lookup failure
                }
            }
            servedItems.push({
                campaignId: c.id,
                creativeId: creative?.id,
                advertiserType: c.advertiserType,
                placementCode: placement.code,
                type: creative?.type || (c.listingId ? types_1.AdCreativeType.NATIVE_LISTING : types_1.AdCreativeType.IMAGE),
                title: creative?.title || c.name,
                headline: creative?.headline || (listingData ? listingData.name : c.name),
                body: creative?.body || `Sponsored promotion on ${placement.platform}`,
                ctaText: creative?.ctaText || (listingData ? "View Deal" : "Shop Now"),
                ctaUrl: creative?.ctaUrl ||
                    (listingData
                        ? (0, ghuba_slug_1.getListingPublicUrl)(listingData)
                        : productData
                            ? `/stores?product=${productData.id}`
                            : "/"),
                mediaUrl: creative?.mediaUrl ||
                    (listingData?.images?.[0] ? listingData.images[0] : productData?.images?.[0] ? productData.images[0] : undefined),
                isSponsored: true,
                listing: listingData,
                product: productData,
                trackingPayload: {
                    campaignId: c.id,
                    creativeId: creative?.id,
                    placementCode: placement.code,
                    costKES: costPerImpressionKES,
                },
            });
        }
        return servedItems;
    }
}
exports.AdServingEngine = AdServingEngine;
