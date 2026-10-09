"use strict";
/**
 * lib/search/filterService.ts
 *
 * Query builder and facet resolution for generic and category-specific filters.
 * Ensures zero-injection, type-safe filtering across MongoDB/Prisma.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterService = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const categoryService_1 = require("./categoryService");
const cache_1 = require("@/lib/cache");
class FilterService {
    /**
     * Translates SearchFilterParams into Prisma where conditions for marketplaceListings.
     */
    static buildPrismaWhereFilters(filters = {}, scope = "GHUBA", companyId) {
        const where = {};
        // 1. Mandatory publication & visibility rules
        where.status = "ACTIVE";
        where.isAvailable = filters.isAvailable !== false;
        // 3. Category, SubCategory & Brand Clauses (built with AND clauses to avoid OR clobbering)
        const andClauses = [];
        if (scope === "GHUBA") {
            andClauses.push({
                OR: [
                    { showOnGhuba: true },
                    { showOnGhuba: null },
                    { showOnGhuba: { isSet: false } },
                ],
            });
            andClauses.push({
                OR: [
                    { ghubaAdminApproved: true },
                    { ghubaAdminApproved: null },
                    { ghubaAdminApproved: { isSet: false } },
                ],
            });
            andClauses.push({
                OR: [
                    { ghubaStatus: "APPROVED" },
                    { ghubaStatus: null },
                    { ghubaStatus: { isSet: false } },
                ],
            });
            where.company = {
                OR: [{ showOnGhuba: true }, { showOnGhuba: { isSet: false } }],
            };
        }
        else if (scope === "STORE" && companyId) {
            where.companyId = companyId;
        }
        // 2. Generic Price Range
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            where.finalPrice = {
                ...(filters.minPrice !== undefined && !isNaN(filters.minPrice) && {
                    gte: filters.minPrice,
                }),
                ...(filters.maxPrice !== undefined && !isNaN(filters.maxPrice) && {
                    lte: filters.maxPrice,
                }),
            };
        }
        if (filters.category && filters.category.length > 0) {
            andClauses.push({
                OR: [
                    { category: { in: filters.category } },
                    { productCategory: { name: { in: filters.category, mode: "insensitive" } } },
                    { productCategory: { slug: { in: filters.category, mode: "insensitive" } } },
                ],
            });
        }
        if (filters.subCategory && filters.subCategory.length > 0) {
            andClauses.push({
                OR: [
                    { subCategoryName: { in: filters.subCategory, mode: "insensitive" } },
                    { type: { in: filters.subCategory, mode: "insensitive" } },
                ],
            });
        }
        // 4. Brand (matches both brand and make fields)
        if (filters.brand && filters.brand.length > 0) {
            andClauses.push({
                OR: [
                    { brand: { in: filters.brand, mode: "insensitive" } },
                    { make: { in: filters.brand, mode: "insensitive" } },
                ],
            });
        }
        if (andClauses.length > 0) {
            where.AND = andClauses;
        }
        // 5. Condition
        if (filters.condition && filters.condition.length > 0) {
            where.condition = { in: filters.condition, mode: "insensitive" };
        }
        // 6. Location
        if (filters.location && filters.location.trim()) {
            where.locationName = { contains: filters.location.trim(), mode: "insensitive" };
        }
        // 7. Seller / Store
        if (filters.sellerId) {
            where.companyId = filters.sellerId;
        }
        // 8. Tags
        if (filters.tags && filters.tags.length > 0) {
            where.tags = { hasSome: filters.tags };
        }
        // 9. Category-Specific: Vehicles
        if (filters.make && filters.make.length > 0) {
            where.make = { in: filters.make, mode: "insensitive" };
        }
        if (filters.model && filters.model.length > 0) {
            where.model = { in: filters.model, mode: "insensitive" };
        }
        if (filters.transmission && filters.transmission.length > 0) {
            where.transmission = { in: filters.transmission, mode: "insensitive" };
        }
        if (filters.fuelType && filters.fuelType.length > 0) {
            where.fuelType = { in: filters.fuelType, mode: "insensitive" };
        }
        if (filters.bodyType && filters.bodyType.length > 0) {
            where.type = { in: filters.bodyType, mode: "insensitive" };
        }
        if (filters.yearFrom !== undefined || filters.yearTo !== undefined) {
            where.year = {
                ...(filters.yearFrom !== undefined && { gte: filters.yearFrom }),
                ...(filters.yearTo !== undefined && { lte: filters.yearTo }),
            };
        }
        // 10. Category-Specific: Property
        if (filters.rentOrSale && filters.rentOrSale !== "ALL") {
            where.listingTransactionType = filters.rentOrSale;
        }
        if (filters.bathrooms && filters.bathrooms.length > 0) {
            where.bathrooms = { in: filters.bathrooms };
        }
        return where;
    }
    /**
     * Resolves dynamic filter options (facets, price bounds, category attributes)
     * available for a given category and scope.
     */
    static async getAvailableFilters(params) {
        const scope = params.scope || "GHUBA";
        const categoryArray = Array.isArray(params.category)
            ? params.category.filter(Boolean)
            : params.category
                ? [params.category]
                : [];
        const catKey = categoryArray.length > 0
            ? [...categoryArray].sort().join(",")
            : "all";
        const cacheKey = `filter:facets:${scope}:${params.companyId || "all"}:${catKey}`;
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
                ? {
                    AND: [
                        { OR: [{ showOnGhuba: true }, { showOnGhuba: null }, { showOnGhuba: { isSet: false } }] },
                        { OR: [{ ghubaAdminApproved: true }, { ghubaAdminApproved: null }, { ghubaAdminApproved: { isSet: false } }] },
                        { OR: [{ ghubaStatus: "APPROVED" }, { ghubaStatus: null }, { ghubaStatus: { isSet: false } }] },
                    ],
                }
                : { companyId: params.companyId }),
        };
        if (categoryArray.length > 0) {
            baseWhere.OR = [
                { category: { in: categoryArray } },
                { productCategory: { name: { in: categoryArray, mode: "insensitive" } } },
                { productCategory: { slug: { in: categoryArray, mode: "insensitive" } } },
            ];
        }
        // Parallel retrieval of:
        // 1. Price bounds for filtered listings
        // 2. Sample listings matching baseWhere to extract live counts
        // 3. All visible product categories
        // 4. Counts of listings per category
        const [priceAgg, rawListings, allProductCategories, categoryListingGroups] = await Promise.all([
            prismadb_1.default.marketplaceListings.aggregate({
                where: baseWhere,
                _min: { finalPrice: true },
                _max: { finalPrice: true },
            }),
            prismadb_1.default.marketplaceListings.findMany({
                where: baseWhere,
                select: {
                    brand: true,
                    condition: true,
                    category: true,
                    subCategoryName: true,
                    make: true,
                },
                take: 500,
            }),
            prismadb_1.default.productCategory.findMany({
                where: {
                    visible: true,
                    ...(scope === "STORE" && params.companyId
                        ? { OR: [{ companyId: params.companyId }, { companyId: null }] }
                        : {}),
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    icon: true,
                    subcategories: true,
                    allBrands: true,
                    productCount: true,
                },
                orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
                take: 100,
            }),
            prismadb_1.default.marketplaceListings.groupBy({
                by: ["category"],
                where: {
                    status: "ACTIVE",
                    isAvailable: true,
                    ...(scope === "GHUBA"
                        ? { showOnGhuba: true, ghubaAdminApproved: true, ghubaStatus: "APPROVED" }
                        : { companyId: params.companyId }),
                    category: { not: null },
                },
                _count: { _all: true },
            }).catch(() => []),
        ]);
        // Build category facet options with accurate counts
        const categoryCountMap = new Map();
        for (const group of categoryListingGroups) {
            if (group.category) {
                categoryCountMap.set(group.category.toLowerCase(), group._count._all);
            }
        }
        const categoryOptionsMap = new Map();
        for (const pc of allProductCategories) {
            const count = categoryCountMap.get(pc.name.toLowerCase()) ?? pc.productCount ?? 0;
            categoryOptionsMap.set(pc.name.toLowerCase(), {
                value: pc.name,
                label: pc.name,
                count,
            });
        }
        // Include any categories present in listings but not in ProductCategory
        for (const group of categoryListingGroups) {
            if (group.category && !categoryOptionsMap.has(group.category.toLowerCase())) {
                categoryOptionsMap.set(group.category.toLowerCase(), {
                    value: group.category,
                    label: group.category,
                    count: group._count._all,
                });
            }
        }
        const categoryOptions = Array.from(categoryOptionsMap.values())
            .sort((a, b) => (b.count || 0) - (a.count || 0));
        // Identify matched category specs & product categories
        const primaryCategory = categoryArray[0];
        const spec = categoryService_1.CategoryService.resolveCategorySpec(primaryCategory);
        const matchedProductCats = allProductCategories.filter((pc) => categoryArray.some((c) => pc.name.toLowerCase() === c.toLowerCase() ||
            pc.slug.toLowerCase() === c.toLowerCase()));
        // Compute distinct brand, condition, and subcategory options
        const brandCounts = new Map();
        const conditionCounts = new Map();
        const subCategoryCounts = new Map();
        // 1. Live listing counts
        for (const item of rawListings) {
            if (item.brand) {
                brandCounts.set(item.brand, (brandCounts.get(item.brand) || 0) + 1);
            }
            if (item.make) {
                brandCounts.set(item.make, (brandCounts.get(item.make) || 0) + 1);
            }
            if (item.condition) {
                conditionCounts.set(item.condition, (conditionCounts.get(item.condition) || 0) + 1);
            }
            if (item.subCategoryName) {
                subCategoryCounts.set(item.subCategoryName, (subCategoryCounts.get(item.subCategoryName) || 0) + 1);
            }
        }
        // 2. Populate subcategories and brands from taxonomy & specs when category is selected
        if (categoryArray.length > 0) {
            // Subcategories from ProductCategory
            for (const pc of matchedProductCats) {
                if (Array.isArray(pc.subcategories)) {
                    for (const s of pc.subcategories) {
                        const subObj = s && typeof s === "object" && !Array.isArray(s)
                            ? s
                            : null;
                        const name = typeof s === "string"
                            ? s
                            : typeof subObj?.name === "string"
                                ? subObj.name
                                : undefined;
                        if (name && !subCategoryCounts.has(name)) {
                            subCategoryCounts.set(name, 0);
                        }
                    }
                }
            }
            // Brands from ProductCategory
            for (const pc of matchedProductCats) {
                if (Array.isArray(pc.allBrands)) {
                    for (const b of pc.allBrands) {
                        if (b && typeof b === "string" && !brandCounts.has(b)) {
                            brandCounts.set(b, 0);
                        }
                    }
                }
            }
            // Brands / Makes from CATEGORY_SPECS
            if (spec) {
                const brandOrMakeAttr = spec.attributes.find((a) => a.key === "brand" || a.key === "make");
                if (brandOrMakeAttr?.options) {
                    for (const opt of brandOrMakeAttr.options) {
                        if (!brandCounts.has(opt.value)) {
                            brandCounts.set(opt.value, 0);
                        }
                    }
                }
            }
        }
        const brandOptions = Array.from(brandCounts.entries())
            .map(([b, count]) => ({ value: b, label: b, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 30);
        const conditionOptions = Array.from(conditionCounts.entries())
            .map(([c, count]) => ({ value: c, label: c, count }))
            .sort((a, b) => b.count - a.count);
        const subCatOptions = Array.from(subCategoryCounts.entries())
            .map(([s, count]) => ({ value: s, label: s, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 30);
        const genericFilters = [
            {
                key: "category",
                title: "Category",
                type: "checkbox",
                options: categoryOptions,
            },
            ...(subCatOptions.length > 0
                ? [
                    {
                        key: "subCategory",
                        title: "Subcategory",
                        type: "checkbox",
                        options: subCatOptions,
                    },
                ]
                : []),
            ...(brandOptions.length > 0
                ? [
                    {
                        key: "brand",
                        title: "Brand",
                        type: "checkbox",
                        options: brandOptions,
                    },
                ]
                : []),
            ...(conditionOptions.length > 0
                ? [
                    {
                        key: "condition",
                        title: "Condition",
                        type: "checkbox",
                        options: conditionOptions,
                    },
                ]
                : []),
        ];
        // Resolve Category-Specific attributes
        let categorySpecificFilters = [];
        if (spec && spec.attributes) {
            categorySpecificFilters = spec.attributes.filter((a) => a.key !== "brand" && a.key !== "make" && a.key !== "condition");
        }
        const response = {
            categories: categoryOptions,
            categoryName: spec?.name || matchedProductCats[0]?.name || primaryCategory,
            categorySlug: spec?.slug || matchedProductCats[0]?.slug,
            priceRange: {
                min: priceAgg._min?.finalPrice || 0,
                max: priceAgg._max?.finalPrice || 500000,
            },
            genericFilters,
            categorySpecificFilters,
        };
        await (0, cache_1.cacheSet)(cacheKey, response, 600).catch(() => { });
        return response;
    }
}
exports.FilterService = FilterService;
