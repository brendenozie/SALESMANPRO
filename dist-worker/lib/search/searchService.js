"use strict";
/**
 * lib/search/searchService.ts
 *
 * Core Search & Discovery Engine for Ghuba Marketplace and SalesmanPro Tenant Stores.
 * Provides transparent relevance scoring, multi-token indexing, channel scoping,
 * debounced autocomplete, and no-results fallback recommendations.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const cache_1 = require("@/lib/cache");
const filterService_1 = require("./filterService");
const categoryService_1 = require("./categoryService");
const searchAnalyticsService_1 = require("@/lib/search/searchAnalyticsService");
const PUBLIC_SEARCH_SELECT = {
    id: true,
    name: true,
    description: true,
    images: true,
    finalPrice: true,
    sellingPrice: true,
    discount: true,
    isAvailable: true,
    isFeatured: true,
    isFlashDeal: true,
    isNewArrival: true,
    isDiscounted: true,
    category: true,
    subCategoryName: true,
    productCategoryId: true,
    brand: true,
    model: true,
    condition: true,
    locationName: true,
    companyId: true,
    make: true,
    year: true,
    transmission: true,
    fuelType: true,
    type: true,
    bathrooms: true,
    bedrooms: true,
    company: {
        select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            site: true,
        },
    },
    createdAt: true,
};
function normalizeImages(images) {
    if (!images)
        return [];
    if (Array.isArray(images)) {
        return images
            .map((img) => (typeof img === "string" ? img : img?.url))
            .filter(Boolean);
    }
    return [];
}
class SearchService {
    /**
     * Sanitizes query text: strips dangerous regex/injection chars, trims whitespace.
     */
    static sanitizeQuery(query) {
        if (!query)
            return "";
        return query
            .trim()
            .replace(/[\0\x08\x09\x1a\n\r"';\\\%]/g, "")
            .replace(/\s+/g, " ")
            .slice(0, 100);
    }
    /**
     * Splits search query into meaningful tokens.
     */
    static tokenize(query) {
        const cleaned = this.sanitizeQuery(query).toLowerCase();
        if (!cleaned)
            return [];
        const stopWords = new Set(["in", "for", "and", "or", "the", "a", "an", "of", "with", "at", "by", "to"]);
        return cleaned
            .replace(/[^\w\s]/g, " ")
            .split(/\s+/)
            .filter((token) => token.length > 1 && !stopWords.has(token));
    }
    /**
     * Computes transparent relevance score for a listing against search tokens.
     */
    static computeRelevanceScore(listing, fullQuery, tokens) {
        if (!fullQuery && tokens.length === 0)
            return 0;
        let score = 0;
        const lowerQuery = fullQuery.toLowerCase();
        const nameLower = (listing.name || "").toLowerCase();
        const descLower = (listing.description || "").toLowerCase();
        const brandLower = (listing.brand || "").toLowerCase();
        const modelLower = (listing.model || "").toLowerCase();
        const catLower = (listing.category || "").toLowerCase();
        const subCatLower = (listing.subCategoryName || "").toLowerCase();
        // 1. Exact match in name
        if (nameLower === lowerQuery) {
            score += 150;
        }
        else if (nameLower.startsWith(lowerQuery)) {
            score += 100;
        }
        else if (nameLower.includes(lowerQuery)) {
            score += 75;
        }
        // 2. Token-level matching
        for (const token of tokens) {
            if (nameLower.includes(token))
                score += 25;
            if (brandLower.includes(token))
                score += 30;
            if (modelLower.includes(token))
                score += 25;
            if (catLower.includes(token))
                score += 20;
            if (subCatLower.includes(token))
                score += 15;
            if (descLower.includes(token))
                score += 8;
        }
        // 3. Merchandising signals
        if (listing.isFeatured)
            score += 15;
        if (listing.isFlashDeal)
            score += 10;
        if (listing.isNewArrival)
            score += 10;
        if (listing.discount && listing.discount > 0)
            score += 8;
        if (listing.isAvailable)
            score += 10;
        return score;
    }
    /**
     * Executes a comprehensive search with filters, relevance ranking, and pagination.
     */
    static async searchListings(params) {
        const startTime = Date.now();
        const rawQuery = params.q || "";
        const cleanQuery = this.sanitizeQuery(rawQuery);
        const tokens = this.tokenize(cleanQuery);
        const scope = params.scope || (params.companyId ? "STORE" : "GHUBA");
        const limit = Math.min(Math.max(1, params.limit || 24), 100);
        const page = Math.max(1, params.page || 1);
        const sort = params.sort || (cleanQuery ? "relevance" : "newest");
        // Cache key for search results
        const cacheKey = `search:${scope}:${params.companyId || "global"}:${JSON.stringify({
            q: cleanQuery,
            filters: params.filters || {},
            sort,
            page,
            limit,
        })}`;
        try {
            const cached = await (0, cache_1.cacheGet)(cacheKey);
            if (cached) {
                // Record telemetry asynchronously even on cache hit
                searchAnalyticsService_1.SearchAnalyticsService.logSearchEvent({
                    query: cleanQuery,
                    normalizedQuery: cleanQuery.toLowerCase(),
                    scope,
                    companyId: params.companyId,
                    storeSlug: params.storeSlug,
                    resultCount: cached.meta?.total || 0,
                    filtersApplied: params.filters || {},
                    sort,
                    userId: params.userId,
                    visitorId: params.visitorId,
                    timestamp: new Date(),
                }).catch(() => { });
                return cached;
            }
        }
        catch { }
        // 1. Build Base Prisma Where from filters
        const where = filterService_1.FilterService.buildPrismaWhereFilters(params.filters, scope, params.companyId);
        // 2. Add text query criteria
        if (cleanQuery) {
            const textConditions = [
                { name: { contains: cleanQuery, mode: "insensitive" } },
                { brand: { contains: cleanQuery, mode: "insensitive" } },
                { model: { contains: cleanQuery, mode: "insensitive" } },
                { category: { contains: cleanQuery, mode: "insensitive" } },
                { subCategoryName: { contains: cleanQuery, mode: "insensitive" } },
                { description: { contains: cleanQuery, mode: "insensitive" } },
                { tags: { has: cleanQuery } },
            ];
            // Also support individual tokens if multiple words
            if (tokens.length > 1) {
                for (const token of tokens) {
                    textConditions.push({ name: { contains: token, mode: "insensitive" } }, { brand: { contains: token, mode: "insensitive" } }, { model: { contains: token, mode: "insensitive" } });
                }
            }
            if (where.OR) {
                where.AND = [{ OR: where.OR }, { OR: textConditions }];
                delete where.OR;
            }
            else {
                where.OR = textConditions;
            }
        }
        // 3. Sorting mapping
        let orderBy = { createdAt: "desc" };
        if (sort === "price_asc") {
            orderBy = { finalPrice: "asc" };
        }
        else if (sort === "price_desc") {
            orderBy = { finalPrice: "desc" };
        }
        else if (sort === "discount") {
            orderBy = { discount: "desc" };
        }
        else if (sort === "newest") {
            orderBy = { createdAt: "desc" };
        }
        // 4. Fetch candidates
        // When sorting by relevance with a search term, fetch extra to sort in memory with scoring
        const fetchLimit = sort === "relevance" && cleanQuery ? limit * 3 : limit + 1;
        const skip = sort === "relevance" && cleanQuery ? 0 : (page - 1) * limit;
        const [rawListings, totalCount] = await Promise.all([
            prismadb_1.default.marketplaceListings.findMany({
                where,
                select: PUBLIC_SEARCH_SELECT,
                take: fetchLimit,
                skip: params.cursor ? 1 : skip,
                ...(params.cursor ? { cursor: { id: params.cursor } } : {}),
                orderBy,
            }),
            prismadb_1.default.marketplaceListings.count({ where }),
        ]);
        // 5. Score & Rank if relevance sorting
        let results = rawListings.map((raw) => ({
            id: raw.id,
            name: raw.name,
            description: raw.description,
            images: normalizeImages(raw.images),
            finalPrice: typeof raw.finalPrice === "number" ? raw.finalPrice : Number(raw.sellingPrice) || 0,
            sellingPrice: typeof raw.sellingPrice === "number" ? raw.sellingPrice : 0,
            discount: raw.discount,
            isAvailable: raw.isAvailable,
            isFeatured: raw.isFeatured,
            isFlashDeal: raw.isFlashDeal,
            isNewArrival: raw.isNewArrival,
            isDiscounted: raw.isDiscounted,
            category: raw.category,
            subCategoryName: raw.subCategoryName,
            productCategoryId: raw.productCategoryId,
            brand: raw.brand,
            model: raw.model,
            condition: raw.condition,
            locationName: raw.locationName,
            companyId: raw.companyId,
            company: raw.company,
            make: raw.make,
            year: raw.year,
            transmission: raw.transmission,
            fuelType: raw.fuelType,
            propertyType: raw.type,
            bathrooms: raw.bathrooms,
            bedrooms: raw.bedrooms,
            createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
            score: this.computeRelevanceScore(raw, cleanQuery, tokens),
        }));
        if (sort === "relevance" && cleanQuery) {
            results.sort((a, b) => (b.score || 0) - (a.score || 0));
            // Slice according to page
            const offset = (page - 1) * limit;
            results = results.slice(offset, offset + limit);
        }
        else if (results.length > limit) {
            results = results.slice(0, limit);
        }
        const nextCursor = results.length === limit ? results[results.length - 1]?.id : undefined;
        // 6. Zero-result alternatives and recommendations
        let suggestions = undefined;
        if (totalCount === 0 && cleanQuery) {
            const [altCategories] = await Promise.all([
                categoryService_1.CategoryService.matchCategoriesByTerm(cleanQuery, 4),
            ]);
            // Provide spell check alternatives by taking first token or related words
            const altQueries = [];
            if (tokens.length > 0) {
                altQueries.push(tokens[0]);
            }
            suggestions = {
                alternativeQueries: altQueries,
                relatedCategories: altCategories,
            };
        }
        const responseData = {
            data: results,
            meta: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit) || 1,
                nextCursor,
                hasNextPage: page * limit < totalCount,
                queryTimeMs: Date.now() - startTime,
                scope,
                appliedFilters: params.filters || {},
                sort,
            },
            ...(suggestions ? { suggestions } : {}),
        };
        // Cache warm results
        await (0, cache_1.cacheSet)(cacheKey, responseData, cleanQuery ? 120 : 300).catch(() => { });
        // Asynchronously log telemetry
        searchAnalyticsService_1.SearchAnalyticsService.logSearchEvent({
            query: cleanQuery,
            normalizedQuery: cleanQuery.toLowerCase(),
            scope,
            companyId: params.companyId,
            storeSlug: params.storeSlug,
            resultCount: totalCount,
            filtersApplied: params.filters || {},
            sort,
            userId: params.userId,
            visitorId: params.visitorId,
            timestamp: new Date(),
        }).catch(() => { });
        return responseData;
    }
    /**
     * Fast autocomplete suggestions for search input.
     * Returns matching products, categories, brands, and stores within < 150ms.
     */
    static async getAutocompleteSuggestions(params) {
        const clean = this.sanitizeQuery(params.query);
        if (!clean || clean.length < 2) {
            return { query: clean, suggestions: [], products: [], categories: [], brands: [], stores: [] };
        }
        const scope = params.scope || "GHUBA";
        const cacheKey = `ac:${scope}:${params.companyId || "all"}:${clean.toLowerCase()}`;
        try {
            const cached = await (0, cache_1.cacheGet)(cacheKey);
            if (cached)
                return cached;
        }
        catch { }
        const baseWhere = {
            status: "ACTIVE",
            isAvailable: true,
            ...(scope === "GHUBA"
                ? { showOnGhuba: true, ghubaAdminApproved: true, ghubaStatus: "APPROVED" }
                : { companyId: params.companyId }),
        };
        // Parallel fetch matching products, categories, brands, stores
        const [matchingProducts, matchingCategories, rawBrands, matchingStores] = await Promise.all([
            prismadb_1.default.marketplaceListings.findMany({
                where: {
                    ...baseWhere,
                    OR: [
                        { name: { contains: clean, mode: "insensitive" } },
                        { brand: { contains: clean, mode: "insensitive" } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    category: true,
                    brand: true,
                    finalPrice: true,
                    sellingPrice: true,
                    images: true,
                    company: {
                        select: { name: true, slug: true },
                    },
                },
                take: 5,
                orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
            }),
            categoryService_1.CategoryService.matchCategoriesByTerm(clean, 3),
            prismadb_1.default.marketplaceListings.findMany({
                where: {
                    ...baseWhere,
                    brand: { contains: clean, mode: "insensitive" },
                },
                select: { brand: true },
                take: 10,
            }),
            scope === "GHUBA"
                ? prismadb_1.default.company.findMany({
                    where: {
                        name: { contains: clean, mode: "insensitive" },
                        showOnGhuba: true,
                    },
                    select: { id: true, name: true, slug: true, logoUrl: true },
                    take: 3,
                })
                : Promise.resolve([]),
        ]);
        const distinctBrands = Array.from(new Set(rawBrands.map((b) => b.brand).filter((b) => Boolean(b)))).slice(0, 4);
        const suggestions = [];
        matchingProducts.forEach((p) => {
            if (!suggestions.includes(p.name))
                suggestions.push(p.name);
        });
        matchingCategories.forEach((c) => {
            if (!suggestions.includes(c.name))
                suggestions.push(c.name);
        });
        const response = {
            query: clean,
            suggestions: suggestions.slice(0, 6),
            products: matchingProducts.map((p) => ({
                id: p.id,
                name: p.name,
                category: p.category,
                brand: p.brand,
                price: typeof p.finalPrice === "number" ? p.finalPrice : Number(p.sellingPrice) || 0,
                image: normalizeImages(p.images)[0] || null,
                companyName: p.company?.name || null,
                companySlug: p.company?.slug || null,
            })),
            categories: matchingCategories,
            brands: distinctBrands.map((b) => ({ name: b })),
            stores: matchingStores,
        };
        await (0, cache_1.cacheSet)(cacheKey, response, 300).catch(() => { });
        return response;
    }
}
exports.SearchService = SearchService;
