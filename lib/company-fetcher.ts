import "server-only";
import React from "react";
import { unstable_cache, revalidateTag } from "next/cache";
import prisma from "@/server/db/prismadb";
import { fetchWithCache, buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";

// Safe per-request memoization helper compatible with React 18 types
const requestCache = ((React as any).cache || (<T extends (...args: any[]) => any>(fn: T): T => fn)) as <T extends (...args: any[]) => any>(fn: T) => T;


// Define the valid strategies to ensure type safety across the file
export type FetchStrategy = "lean" | "page" | "api" | "full";

function getIncludeForCategory(category: string) {
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
      createdAt: "desc" as const,
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

const INCLUDE_MAP: Record<FetchStrategy, any> = {
  lean: leanShellInclude(),
  page: pageDataInclude(),
  api: leanShellInclude(),
  full: pageDataInclude(),
};

/**
 * 🔍 Optimized Single-Query Company Finder
 * Executes a single OR lookup across slug, domain, www.domain, and id
 */
async function findCompanyFn(cleanIdentifier: string, strategy: FetchStrategy) {
  const include = INCLUDE_MAP[strategy];
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanIdentifier);
  const strippedWww = cleanIdentifier.replace(/^www\./i, "");
  const withWww = `www.${strippedWww}`;

  // Single unified database query instead of sequential roundtrips
  const company = await prisma.company.findFirst({
    where: {
      OR: [
        { slug: cleanIdentifier },
        { slug: strippedWww },
        { domain: cleanIdentifier },
        { domain: strippedWww },
        { domain: withWww },
        { domain: `https://${strippedWww}` },
        { domain: `https://${withWww}` },
        ...(isObjectId ? [{ id: cleanIdentifier }] : []),
      ],
    },
    include,
  });

  if (!company) {
    return null;
  }

  const latestSubscription: any = (company as any).subscriptionCompanies?.[0] || null;

  return {
    ...company,
    subscription: latestSubscription
      ? {
          isActive:
            latestSubscription.status === "ACTIVE" ||
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
export const findCompanyCached = requestCache(async (
  identifier: string,
  strategy: FetchStrategy = "lean",
) => {
  // 1️⃣ Normalize safely up front to guarantee it's a string
  const cleanIdentifier = (identifier || "")
    .replace(/^www\./, "")
    .toLowerCase()
    .trim();

  if (!cleanIdentifier) return null;

  // 1.5️⃣ Fast-path: If requesting 'lean', check if the richer 'page' entry is already cached!
  // Because 'page' is a complete superset of 'lean', it immediately satisfies the shell layout.
  if (strategy === "lean" || strategy === "api") {
    const pageKey = buildTenantCacheKey(cleanIdentifier, "company_details", { strategy: "page" });
    const cachedPage = await cacheGet<any>(pageKey);
    if (cachedPage) {
      return cachedPage;
    }
  }

  // 2️⃣ Deterministic multi-tenant cache key
  const cacheKey = buildTenantCacheKey(cleanIdentifier, "company_details", { strategy });

  // 3️⃣ Execute with Singleflight stampede protection and two-tier Redis/in-memory caching
  return fetchWithCache(
    cacheKey,
    async () => {
      // Setup Next.js tag-aware cache wrapper for ISR/framework integration
      let data: any;
      try {
        const nextKey = ["company-details", cleanIdentifier, strategy].join(":");
        const cachedFetcher = unstable_cache(
          () => findCompanyFn(cleanIdentifier, strategy),
          [nextKey],
          {
            tags: [
              `company:${cleanIdentifier}`,
              `company-details:${cleanIdentifier}:${strategy}`,
            ],
            revalidate: 600, // 10 minute revalidation
          },
        );
        data = await cachedFetcher();
      } catch (err: any) {
        // Fallback for environments where incrementalCache is not initialized (e.g. workers, tests, CLI)
        data = await findCompanyFn(cleanIdentifier, strategy);
      }

      // If we loaded the rich 'page' or 'full' strategy, simultaneously warm the 'lean' cache key!
      if (data && (strategy === "page" || strategy === "full")) {
        const leanKey = buildTenantCacheKey(cleanIdentifier, "company_details", { strategy: "lean" });
        cacheSet(leanKey, data, 600).catch(() => {});
        // Also cross-link under canonical company id if identifier was a slug/domain
        if (data.id && data.id !== cleanIdentifier) {
          cacheSet(buildTenantCacheKey(data.id, "company_details", { strategy: "page" }), data, 600).catch(() => {});
          cacheSet(buildTenantCacheKey(data.id, "company_details", { strategy: "lean" }), data, 600).catch(() => {});
        }
      }

      return data;
    },
    600 // 10 minute TTL
  );
});


/**
 * -----------------------------------------------------
 * 🧩 Prisma Include Objects
 * -----------------------------------------------------
 */

// Data needed for the main layout (Header, Footer, Context)
export function leanShellInclude() {
  return {
    SEO: true,
    AnalyticsConfig: true,
    StoreCategory: {
      orderBy: { sortOrder: "asc" as const },
      include: {
        category: {
          select: { id: true, name: true, slug: true, image: true, icon: true },
        },
      },
    },
    Announcement: {
      orderBy: { publishedAt: "desc" as const },
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

    addresses: true, // Include the new addresses array for multi-location support
    ShippingSettings: true,
    website: true,
  };
}

// Data needed for the main content of the page (complete superset of lean shell)
export function pageDataInclude() {
  const userSelect = {
    select: {
      id: true,
      name: true,
      image: true,
    },
  };

  const orderedAsc = { orderBy: { order: "asc" as const } };

  return {
    SEO: true,
    AnalyticsConfig: true,
    Announcement: {
      orderBy: { publishedAt: "desc" as const },
      take: 1,
    },
    socialLinks: true,
    policies: true,
    StoreCategory: {
      orderBy: { sortOrder: "asc" as const },
      include: {
        category: {
          select: { id: true, name: true, slug: true, image: true, icon: true },
        },
      },
    },
    ...latestSubscriptionInclude,
    blogs: { orderBy: { publishedAt: "desc" as const }, take: 10 },
    faqs: { orderBy: { order: "asc" as const }, take: 50 },
    testimonials: { orderBy: { order: "asc" as const }, take: 20 },
    heroSlides: { orderBy: { order: "asc" as const }, take: 10 },
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
    events: { orderBy: { createdAt: "desc" as const }, take: 20 },
    Package: true,
    Project: true,
    services: true,
    CoreValues: true,
    CompanyLocation: { include: { location: true } },
    Destination: true,
    TourPackage: true,
    PaymentSettings: true,
    ShippingSettings: true,
    addresses: true, // Include the new addresses array for multi-location support
    website: true,
  };
}

/**
 * -----------------------------------------------------
 * ♻️ Revalidation helpers (for admin API use)
 * -----------------------------------------------------
 */

// Invalidate the shell/page cache for a specific tenant by slug, domain, or id
export async function revalidateCompanyCache(identifier: string) {
  const clean = (identifier || "").replace(/^www\./, "").toLowerCase().trim();
  if (!clean) return;

  const purgeTarget = async (target: string) => {
    try {
      revalidateTag(`company:${target}`);
      revalidateTag(`company-details:${target}:lean`);
      revalidateTag(`company-details:${target}:page`);
      revalidateTag(`company-details:${target}:full`);
    } catch (e) {}

    try {
      await cacheDel(`tenant:${target}:company_details:*`);
      await cacheDel(`tenant:${target}:storefront:*`);
      await cacheDel(`tenant:${target}:config:*`);
      await cacheDel(`company-details:${target}:*`);
    } catch (e) {}
  };

  await purgeTarget(clean);

  // Invalidate any associated slug/domain/id aliases so cross-tenant cache remains in sync
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(clean);
  try {
    const company = await prisma.company.findFirst({
      where: isObjectId ? { id: clean } : { OR: [{ slug: clean }, { domain: clean }] },
      select: { id: true, slug: true, domain: true },
    });
    if (company) {
      if (company.id && company.id !== clean) await purgeTarget(company.id);
      if (company.slug && company.slug.toLowerCase() !== clean) await purgeTarget(company.slug.toLowerCase());
      if (company.domain && company.domain.toLowerCase() !== clean) await purgeTarget(company.domain.toLowerCase());
    }
  } catch (e) {}
}

// Invalidate specific storefront catalog subsets for a tenant
export async function revalidateStore(companyId: string) {
  if (!companyId) return;

  try {
    revalidateTag(`products-${companyId}`);
    revalidateTag(`categories-${companyId}`);
    revalidateTag(`blogs-${companyId}`);
    revalidateTag(`testimonials-${companyId}`);
    revalidateTag(`products-by-flag`);
  } catch (e) {}

  // Invalidate Redis / in-memory cache pipelines
  try {
    await cacheDel(`tenant:${companyId}:products:*`);
    await cacheDel(`tenant:${companyId}:productsByFlag:*`);
    await cacheDel(`tenant:${companyId}:categories:*`);
    await cacheDel(`shop:products:${companyId}:*`);
    await cacheDel(`shop:productsByCategory:*${companyId}*`);
  } catch (e) {}
}

