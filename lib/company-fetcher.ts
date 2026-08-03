import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import prisma from "@/server/db/prismadb";

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
    orderBy: {
      createdAt: "desc" as const,
    },
    take: 1,
    select: {
      id: true,
      status: true,
      renewalDate: true,
      createdAt: true,
      subscription: {
        select: {
          id: true,
          name: true,
          slug: true,
          billingCycle: true,
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
 * 🔍 Base Company Finder (No caching, executed by unstable_cache)
 * The identifier passed here is already cleaned and normalized by the wrapper.
 */
async function findCompanyFn(cleanIdentifier: string, strategy: FetchStrategy) {
  const include = INCLUDE_MAP[strategy];

  // 1️⃣ Lookup by custom domain first (checking both raw and www. variants)
  let company = await prisma.company.findFirst({
    where: {
      OR: [{ domain: cleanIdentifier }, { domain: `www.${cleanIdentifier}` }],
    },
    include,
  });

  // 2️⃣ Fallback: Lookup by subdomain / slug
  if (!company) {
    company = await prisma.company.findFirst({
      where: { slug: cleanIdentifier },
      include,
    });
  }

  if (!company) {
    company = await prisma.company.findFirst({
      where: { id: cleanIdentifier },
      include,
    });
  }

  // const latestSubscription = company?.subscriptionCompanies?.[0];

  // const subscriptionInfo = latestSubscription
  //   ? {
  //       status:
  //         latestSubscription.renewalDate &&
  //         latestSubscription.renewalDate > new Date()
  //           ? "ACTIVE"
  //           : "INACTIVE",

  //       renewalDate: latestSubscription.renewalDate,
  //       subscriptionStatus: latestSubscription.status,

  //       plan: latestSubscription.subscription,
  //     }
  //   : {
  //       status: "INACTIVE",
  //       renewalDate: null,
  //       subscriptionStatus: null,
  //       plan: null,
  //     };

  const latestSubscription = company?.subscriptionCompanies?.[0] || null;

  return {
    ...company,
    subscription: latestSubscription
      ? {
          isActive:
            !!latestSubscription.renewalDate &&
            latestSubscription.renewalDate > new Date(),

          status: latestSubscription.status,
          renewalDate: latestSubscription.renewalDate,
          plan: latestSubscription.subscription,
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
 * Generates an instantaneous cache match using highly stable string primitives.
 */
export async function findCompanyCached(
  identifier: string,
  strategy: FetchStrategy = "lean",
) {
  // 1️⃣ Normalize safely up front to guarantee it's a string
  const cleanIdentifier = (identifier || "")
    .replace(/^www\./, "")
    .toLowerCase()
    .trim();

  // 2️⃣ Build a stable cache key
  const key = ["company-details", cleanIdentifier, strategy].join(":");

  // 3️⃣ Setup the Next.js cache with the safe primitive variable
  const cachedFetcher = unstable_cache(
    () => findCompanyFn(cleanIdentifier, strategy), // 👈 Arrow func keeps scope clean
    [key],
    {
      tags: [
        `company:${cleanIdentifier}`,
        `company-details:${cleanIdentifier}:${strategy}`,
      ], // 👈 Safe primitive variables
      revalidate: false, // Relies on manual revalidation from API routes
    },
  );

  // 4️⃣ Execute
  return cachedFetcher();
}

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

// Invalidate the shell/page cache for a specific tenant by slug or domain
export async function revalidateCompanyCache(identifier: string) {
  // 👈 Renamed parameter from 'slug' to 'identifier' for accuracy
  revalidateTag(`company:${identifier}`);
  revalidateTag(`company-details:${identifier}:lean`);
  revalidateTag(`company-details:${identifier}:page`);
  revalidateTag(`company-details:${identifier}:full`);
}

// Invalidate specific data subsets for a tenant
export const revalidateStore = (companyId: string) => {
  revalidateTag(`products-${companyId}`);
  revalidateTag(`categories-${companyId}`);
  revalidateTag(`blogs-${companyId}`);
  revalidateTag(`testimonials-${companyId}`);
};
