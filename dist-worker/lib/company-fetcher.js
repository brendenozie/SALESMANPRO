"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidateStore = exports.revalidateCompanyCache = exports.pageDataInclude = exports.leanShellInclude = exports.findCompanyCached = void 0;
require("server-only");
const react_1 = __importDefault(require("react"));
const cache_1 = require("next/cache");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const cache_2 = require("@/lib/cache");
// Safe per-request memoization helper compatible with React 18 types
const requestCache = (react_1.default.cache || ((fn) => fn));
function getIncludeForCategory(category) {
    switch (category) {
        case "ecommerce":
            return {
                marketplaceListings: true,
                promotions: true,
            };
        case "healthcare":
            return {
                Doctor: true,
                services: true,
            };
        case "education":
            return {
                educators: true,
                courses: true,
            };
        default:
            return {};
    }
}
const latestSubscriptionInclude = {
    subscriptionCompanies: {
        where: {
            status: {
                in: ["ACTIVE", "AWAITING_CONFIRMATION", "PAST_DUE"],
            },
        },
        // get the latest subscription by createdAt date
        orderBy: {
            createdAt: "desc",
        },
        take: 1,
        select: {
            id: true,
            status: true,
            renewalDate: true,
            createdAt: true,
            billingCycle: true,
            plan: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    currency: true,
                },
            },
        },
    },
};
const INCLUDE_MAP = {
    lean: leanShellInclude(),
    page: pageDataInclude(),
};
/**
 * 🔍 Optimized Single-Query Company Finder
 * Executes a single OR lookup across slug, domain, www.domain, and id
 */
async function findCompanyFn(cleanIdentifier, strategy) {
    const include = INCLUDE_MAP[strategy];
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanIdentifier);
    // Single unified database query instead of 3 sequential roundtrips
    const company = await prismadb_1.default.company.findFirst({
        where: {
            OR: [
                { slug: cleanIdentifier },
                { domain: cleanIdentifier },
                { domain: `www.${cleanIdentifier}` },
                ...(isObjectId ? [{ id: cleanIdentifier }] : []),
            ],
        },
        include,
    });
    if (!company) {
        return null;
    }
    const latestSubscription = company.subscriptionCompanies?.[0] || null;
    return {
        ...company,
        subscription: latestSubscription
            ? {
                isActive: latestSubscription.status === "ACTIVE" ||
                    (!!latestSubscription.renewalDate && new Date(latestSubscription.renewalDate) > new Date()),
                status: latestSubscription.status,
                renewalDate: latestSubscription.renewalDate,
                plan: latestSubscription.plan,
                billingCycle: latestSubscription.billingCycle,
            }
            : {
                isActive: false,
                status: "INACTIVE",
                renewalDate: null,
                plan: null,
            },
    };
}
/**
 * 🧩 Tenant-aware Cached Fetcher
 * Layer 1: React.cache() - Request-level memoization across generateMetadata, Layout, and Page.
 * Layer 2: fetchWithCache() - Redis + bounded in-memory LRU with Singleflight stampede protection (600s TTL).
 * Layer 3: Next.js unstable_cache - Framework-level tag-based revalidation.
 */
exports.findCompanyCached = requestCache(async (identifier, strategy = "lean") => {
    // 1️⃣ Normalize safely up front to guarantee it's a string
    const cleanIdentifier = (identifier || "")
        .replace(/^www\./, "")
        .toLowerCase()
        .trim();
    if (!cleanIdentifier)
        return null;
    // 1.5️⃣ Fast-path: If requesting 'lean', check if the richer 'page' entry is already cached!
    // Because 'page' is a complete superset of 'lean', it immediately satisfies the shell layout.
    if (strategy === "lean") {
        const pageKey = (0, cache_2.buildTenantCacheKey)(cleanIdentifier, "company_details", { strategy: "page" });
        const cachedPage = await (0, cache_2.cacheGet)(pageKey);
        if (cachedPage) {
            return cachedPage;
        }
    }
    // 2️⃣ Deterministic multi-tenant cache key
    const cacheKey = (0, cache_2.buildTenantCacheKey)(cleanIdentifier, "company_details", { strategy });
    // 3️⃣ Execute with Singleflight stampede protection and two-tier Redis/in-memory caching
    return (0, cache_2.fetchWithCache)(cacheKey, async () => {
        // Setup Next.js tag-aware cache wrapper for ISR/framework integration
        const nextKey = ["company-details", cleanIdentifier, strategy].join(":");
        const cachedFetcher = (0, cache_1.unstable_cache)(() => findCompanyFn(cleanIdentifier, strategy), [nextKey], {
            tags: [
                `company:${cleanIdentifier}`,
                `company-details:${cleanIdentifier}:${strategy}`,
            ],
            revalidate: 600, // 10 minute revalidation
        });
        const data = await cachedFetcher();
        // If we loaded the rich 'page' strategy, simultaneously warm the 'lean' cache key!
        if (data && strategy === "page") {
            const leanKey = (0, cache_2.buildTenantCacheKey)(cleanIdentifier, "company_details", { strategy: "lean" });
            (0, cache_2.cacheSet)(leanKey, data, 600).catch(() => { });
            // Also cross-link under canonical company id if identifier was a slug/domain
            if (data.id && data.id !== cleanIdentifier) {
                (0, cache_2.cacheSet)((0, cache_2.buildTenantCacheKey)(data.id, "company_details", { strategy: "page" }), data, 600).catch(() => { });
                (0, cache_2.cacheSet)((0, cache_2.buildTenantCacheKey)(data.id, "company_details", { strategy: "lean" }), data, 600).catch(() => { });
            }
        }
        return data;
    }, 600 // 10 minute TTL
    );
});
/**
 * -----------------------------------------------------
 * 🧩 Prisma Include Objects
 * -----------------------------------------------------
 */
// Data needed for the main layout (Header, Footer, Context)
function leanShellInclude() {
    return {
        SEO: true,
        AnalyticsConfig: true,
        StoreCategory: {
            orderBy: { sortOrder: "asc" },
            include: {
                category: {
                    select: { id: true, name: true, slug: true, image: true, icon: true },
                },
            },
        },
        Announcement: {
            orderBy: { publishedAt: "desc" },
            take: 1,
        },
        socialLinks: true,
        policies: true,
        CompanyLocation: {
            include: {
                location: true,
            },
        },
        ...latestSubscriptionInclude,
        addresses: true,
        ShippingSettings: true,
        website: true,
    };
}
exports.leanShellInclude = leanShellInclude;
// Data needed for the main content of the page (complete superset of lean shell)
function pageDataInclude() {
    const userSelect = {
        select: {
            id: true,
            name: true,
            image: true,
        },
    };
    const orderedAsc = { orderBy: { order: "asc" } };
    return {
        SEO: true,
        AnalyticsConfig: true,
        Announcement: {
            orderBy: { publishedAt: "desc" },
            take: 1,
        },
        socialLinks: true,
        policies: true,
        StoreCategory: {
            orderBy: { sortOrder: "asc" },
            include: {
                category: {
                    select: { id: true, name: true, slug: true, image: true, icon: true },
                },
            },
        },
        ...latestSubscriptionInclude,
        blogs: { orderBy: { publishedAt: "desc" } },
        faqs: orderedAsc,
        testimonials: orderedAsc,
        heroSlides: orderedAsc,
        promotions: {
            select: {
                title: true,
                description: true,
                startsAt: true,
                endsAt: true,
                badgeText: true,
                price: true,
                ctaText: true,
                ctaLink: true,
                bannerUrl: true,
                featureImage1: true,
                featureImage2: true,
                featureImage3: true,
                perks: true,
                trustLogos: true,
            },
        },
        PageSection: orderedAsc,
        Collection: orderedAsc,
        appPromos: true,
        marketplaceListings: {
            take: 12,
            select: {
                id: true,
                name: true,
                description: true,
                finalPrice: true,
                type: true,
                sellingPrice: true,
                images: true,
                pricingTiers: true,
                isAvailable: true,
                isFeatured: true,
                category: true,
                option: true,
            },
        },
        Writer: { where: { user: { isNot: null } }, include: { user: userSelect } },
        Expert: { where: { user: { isNot: null } }, include: { user: userSelect } },
        Doctor: { where: { User: { isNot: null } }, include: { User: userSelect } },
        salesAgents: {
            where: { user: { isNot: null } },
            include: { user: userSelect },
        },
        educators: {
            where: { user: { isNot: null } },
            include: { user: userSelect },
        },
        Podcast: true,
        courses: true,
        events: true,
        Package: true,
        Project: true,
        services: true,
        CoreValues: true,
        CompanyLocation: { include: { location: true } },
        Destination: true,
        TourPackage: true,
        PaymentSettings: true,
        ShippingSettings: true,
        addresses: true,
        website: true,
    };
}
exports.pageDataInclude = pageDataInclude;
/**
 * -----------------------------------------------------
 * ♻️ Revalidation helpers (for admin API use)
 * -----------------------------------------------------
 */
// Invalidate the shell/page cache for a specific tenant by slug, domain, or id
async function revalidateCompanyCache(identifier) {
    const clean = (identifier || "").replace(/^www\./, "").toLowerCase().trim();
    if (!clean)
        return;
    const purgeTarget = async (target) => {
        try {
            (0, cache_1.revalidateTag)(`company:${target}`);
            (0, cache_1.revalidateTag)(`company-details:${target}:lean`);
            (0, cache_1.revalidateTag)(`company-details:${target}:page`);
            (0, cache_1.revalidateTag)(`company-details:${target}:full`);
        }
        catch (e) { }
        try {
            await (0, cache_2.cacheDel)(`tenant:${target}:company_details:*`);
            await (0, cache_2.cacheDel)(`tenant:${target}:storefront:*`);
            await (0, cache_2.cacheDel)(`tenant:${target}:config:*`);
            await (0, cache_2.cacheDel)(`company-details:${target}:*`);
        }
        catch (e) { }
    };
    await purgeTarget(clean);
    // Invalidate any associated slug/domain/id aliases so cross-tenant cache remains in sync
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(clean);
    try {
        const company = await prismadb_1.default.company.findFirst({
            where: isObjectId ? { id: clean } : { OR: [{ slug: clean }, { domain: clean }] },
            select: { id: true, slug: true, domain: true },
        });
        if (company) {
            if (company.id && company.id !== clean)
                await purgeTarget(company.id);
            if (company.slug && company.slug.toLowerCase() !== clean)
                await purgeTarget(company.slug.toLowerCase());
            if (company.domain && company.domain.toLowerCase() !== clean)
                await purgeTarget(company.domain.toLowerCase());
        }
    }
    catch (e) { }
}
exports.revalidateCompanyCache = revalidateCompanyCache;
// Invalidate specific storefront catalog subsets for a tenant
async function revalidateStore(companyId) {
    if (!companyId)
        return;
    try {
        (0, cache_1.revalidateTag)(`products-${companyId}`);
        (0, cache_1.revalidateTag)(`categories-${companyId}`);
        (0, cache_1.revalidateTag)(`blogs-${companyId}`);
        (0, cache_1.revalidateTag)(`testimonials-${companyId}`);
        (0, cache_1.revalidateTag)(`products-by-flag`);
    }
    catch (e) { }
    // Invalidate Redis / in-memory cache pipelines
    try {
        await (0, cache_2.cacheDel)(`tenant:${companyId}:products:*`);
        await (0, cache_2.cacheDel)(`tenant:${companyId}:productsByFlag:*`);
        await (0, cache_2.cacheDel)(`tenant:${companyId}:categories:*`);
        await (0, cache_2.cacheDel)(`shop:products:${companyId}:*`);
        await (0, cache_2.cacheDel)(`shop:productsByCategory:*${companyId}*`);
    }
    catch (e) { }
}
exports.revalidateStore = revalidateStore;
