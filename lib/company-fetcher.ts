import "server-only";
import React from "react";
import { unstable_cache, revalidateTag } from "next/cache";
import prisma from "@/server/db/prismadb";
import { fetchWithCache, buildTenantCacheKey, cacheDel } from "@/lib/cache";

// Safe per-request memoization helper compatible with React 18 types
const requestCache = ((React as any).cache || (<T extends (...args: any[]) => any>(fn: T): T => fn)) as <T extends (...args: any[]) => any>(fn: T) => T;


// Define the valid strategies to ensure type safety across the file
type FetchStrategy = "lean" | "page";

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
        in: ["ACTIVE", "AWAITING_CONFIRMATION"],
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

const INCLUDE_MAP = {
  lean: leanShellInclude(),
  page: pageDataInclude(),
};

/**
 * 🔍 Optimized Single-Query Company Finder
 * Executes a single OR lookup across slug, domain, www.domain, and id
 */
async function findCompanyFn(cleanIdentifier: string, strategy: FetchStrategy) {
  const include = INCLUDE_MAP[strategy];
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanIdentifier);

  // Single unified database query instead of 3 sequential roundtrips
  const company = await prisma.company.findFirst({
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
          isActive:
            !!latestSubscription.renewalDate &&
            latestSubscription.renewalDate > new Date(),
          status:
            latestSubscription?.renewalDate &&
            latestSubscription?.renewalDate > new Date()
              ? "ACTIVE"
              : "INACTIVE",
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

  // 2️⃣ Deterministic multi-tenant cache key
  const cacheKey = buildTenantCacheKey(cleanIdentifier, "company_details", { strategy });

  // 3️⃣ Execute with Singleflight stampede protection and two-tier Redis/in-memory caching
  return fetchWithCache(
    cacheKey,
    async () => {
      // Setup Next.js tag-aware cache wrapper for ISR/framework integration
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
      return cachedFetcher();
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
  };
}

// Data needed for the main content of the page
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
    ...latestSubscriptionInclude,
    blogs: { orderBy: { publishedAt: "desc" as const } },
    faqs: orderedAsc,
    testimonials: orderedAsc,
    heroSlides: orderedAsc,
    StoreCategory: true,
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
    addresses: true, // Include the new addresses array for multi-location support
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

  try {
    revalidateTag(`company:${clean}`);
    revalidateTag(`company-details:${clean}:lean`);
    revalidateTag(`company-details:${clean}:page`);
    revalidateTag(`company-details:${clean}:full`);
  } catch (e) {}

  // Invalidate Redis / in-memory cache pipelines
  try {
    await cacheDel(`tenant:${clean}:company_details:*`);
    await cacheDel(`tenant:${clean}:storefront:*`);
    await cacheDel(`tenant:${clean}:config:*`);
    await cacheDel(`company-details:${clean}:*`);
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

