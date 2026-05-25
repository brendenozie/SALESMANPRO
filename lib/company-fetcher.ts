// company-fetcher.ts
import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import prisma from "@/server/db/prismadb";

const INCLUDE_MAP = {
  lean: leanShellInclude(),
  page: pageDataInclude(),
};

/**
 * 🔍 Base Company Finder (no caching, called inside unstable_cache)
 * Accepts a simple 'identifier' string which could be a custom domain OR a subdomain slug.
 */
async function findCompanyFn(identifier: string, strategy: "lean" | "page") {
  const include = INCLUDE_MAP[strategy];
  const normalizedHost = identifier.replace(/^www\./, "").toLowerCase();

  // 1️⃣ Lookup by custom domain
  let company = await prisma.company.findFirst({
    where: {
      OR: [{ domain: normalizedHost }, { domain: `www.${normalizedHost}` }],
    },
    include,
  });

  // 2️⃣ Fallback: Lookup by subdomain / slug matching
  if (!company) {
    company = await prisma.company.findFirst({
      where: { slug: normalizedHost },
      include,
    });
  }

  return company;
}

/**
 * 🧩 Tenant-aware Cached Fetcher
 * Generates an instantaneous cache match using highly stable string primitives.
 */
// company-fetcher.ts

// ... keep everything else above the same ...

/**
 * 🧩 Tenant-aware Cached Fetcher
 */
export async function findCompanyCached(
  identifier: string,
  strategy: 'lean' | 'page' = 'lean'
) {
  // 1️⃣ Normalize safely up front to guarantee it's a string
  const cleanIdentifier = (identifier || '')
    .replace(/^www\./, '')
    .toLowerCase()
    .trim();

  // 2️⃣ Build a stable cache key
  const key = ['company-details', cleanIdentifier, strategy].join(':');

  // 3️⃣ Pass the pre-normalized string safely into the tags array
  const cachedFetcher = unstable_cache(
    findCompanyFn,
    [key],
    {
      tags: [`company:${cleanIdentifier}`], // 👈 Safe primitive variable
      revalidate: false,  //
    }
  );

  // 4️⃣ Execute with the safe fallback
  return cachedFetcher(cleanIdentifier, strategy);
}


// // company-fetcher.ts
// import 'server-only';
// import { unstable_cache, revalidateTag } from 'next/cache';
// import prisma from '@/server/db/prismadb';

// /**
//  * -----------------------------------------------------
//  * 🔍 Base Company Finder (no caching)
//  * -----------------------------------------------------
//  */
// async function findCompanyFn(
//   slug: string,
//   requestedHost?: string | null,
//   requestedSubdomain?: string | null,
//   include?: any
// ) {
//   let company = null;

//   // 1️⃣ Lookup by custom domain
//   if (requestedHost) {
//     const normalizedHost = requestedHost
//       .replace(/^https?:\/\//, '')
//       .replace(/^www\./, '')
//       .toLowerCase();

//     company = await prisma.company.findFirst({
//       where: {
//         OR: [
//           { domain: normalizedHost },
//           { domain: `www.${normalizedHost}` },
//         ],
//       },
//       include,
//     });
//   }

//   // 2️⃣ Lookup by subdomain
//   if (!company && requestedSubdomain) {
//     company = await prisma.company.findFirst({
//       where: { slug: requestedSubdomain },
//       include,
//     });
//   }

//   // 3️⃣ Fallback to slug
//   if (!company) {
//     company = await prisma.company.findFirst({
//       where: { slug },
//       include,
//     });
//   }

//   return company;
// }

// /**
//  * -----------------------------------------------------
//  * 🧩 Tenant-aware Cached Fetcher
//  * -----------------------------------------------------
//  * This builds a unique cache key per tenant (slug, host, subdomain)
//  * while still using revalidation tags for instant invalidation.
//  */
// export async function findCompanyCached(
//   slug: string,
//   requestedHost?: string | null,
//   requestedSubdomain?: string | null,
//   include?: any
// ) {
//   // 🪄 Build a stable, tenant-specific cache key
//   const key = [
//     'company-details',
//     slug ?? 'none',
//     requestedHost ?? 'none',
//     requestedSubdomain ?? 'none',
//   ].join(':');

//   // ⚙️ Create a cached version of the base fetcher
//   const cachedFetcher = unstable_cache(findCompanyFn, [key], {
//     tags: [`company:${slug}`], // tag for bulk + per-tenant revalidation
//     revalidate: false, // disable auto revalidation; we'll use tag invalidation instead
//   });

//   return cachedFetcher(slug, requestedHost, requestedSubdomain, include);
// }

// /**
//  * -----------------------------------------------------
//  * ♻️ Revalidation helper (for admin use)
//  * -----------------------------------------------------
//  * Call this after updating a company's data in the admin panel.
//  */
export async function revalidateCompanyCache(slug: string) {
  // revalidateTag('companies');      // invalidate all companies
  revalidateTag(`company:${slug}`); // invalidate this specific company
}

export const revalidateStore = (companyId: string) => {
  revalidateTag(`products-${companyId}`);
  revalidateTag(`categories-${companyId}`);
  revalidateTag(`blogs-${companyId}`);
  revalidateTag(`testimonials-${companyId}`);
  // console.log(`✨ All caches purged for company: ${companyId}`);
};

// export const triggerRefresh = {
//   products: (companyId: string) => revalidateTag(`products-${companyId}`),
//   categories: (catId: string) => revalidateTag(`cat-${catId}`),
//   testimonials: (companyId: string) => revalidateTag(`testimonials-${companyId}`),
//   blogs: (companyId: string) => revalidateTag(`blogs-${companyId}`),
// };

// export async function onBlogUpdate(companyId: string) {
//   // Clears the cache for just this company's blog list
//   revalidateTag(`blogs-${companyId}`);
// }

// // Call this after prisma.testimonial.create(...)
// export async function onNewTestimonial(companyId: string) {
//   revalidateTag(`testimonials-${companyId}`);
// }

// export async function refreshCategoryCache(categoryId?: string, agentId?: string) {
//   if (categoryId) revalidateTag(`cat-${categoryId}`);
//   if (agentId) revalidateTag(`agent-${agentId}`);
//   // Force refresh for anyone looking at "all listings"
//   revalidateTag('marketplace-listings');
// }

// /**
//  * Clears the cache for a specific company's product list.
//  * Call this inside your Prisma update/create/delete logic.
//  */
// export async function refreshCompanyProducts(companyId: string) {
//   try {
//     // 1. Clears the specific data cache we tagged in the API
//     revalidateTag(`products-${companyId}`);

//     // 2. Optional: Clears the layout/page cache if you have a
//     // frontend route like /marketplace/[companyId]
//     // revalidatePath(`/marketplace/${companyId}`);

//     console.log(`Cache cleared for company: ${companyId}`);
//   } catch (error) {
//     console.error("Revalidation failed:", error);
//   }
// }
// /**
//  * -----------------------------------------------------
//  * 🧩 Prisma Include Objects
//  * -----------------------------------------------------
//  */


// // Data needed for the main layout (Header, Footer, Context)
export function leanShellInclude() {
  return {
    SEO: true,
    AnalyticsConfig: true,
    StoreCategory: {
      orderBy: { sortOrder: "asc" as const },
      include: {
        category: {
          select: { id: true, name: true, slug: true, image: true, icon: true }
        }
      }
    },
    Announcement: {
      orderBy: { publishedAt: "desc" as const },
      take: 1,
    },
    socialLinks: true,
    policies: true,
    CompanyLocation: {
      include: {
        location: true
      }
    },
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
    // Relations for page content
    blogs: { orderBy: { publishedAt: "desc" as const } },
    faqs: orderedAsc,
    testimonials: orderedAsc,
    heroSlides: orderedAsc,
    StoreCategory: true,
    promotions: {
      select: {
        title: true, description: true, startsAt: true, endsAt: true, badgeText: true,
        price: true, ctaText: true, ctaLink: true, bannerUrl: true, featureImage1: true,
        featureImage2: true, featureImage3: true, perks: true, trustLogos: true,
      },
    },
    PageSection: orderedAsc,
    Collection: orderedAsc,
    appPromos: true,
    marketplaceListings: {
      take: 12,
      select: {
        id: true, name: true, description: true, finalPrice: true, type: true,
        sellingPrice: true, images: true, pricingTiers: true, isAvailable: true,
        isFeatured: true, category: true,
      },
    },
    Writer:      { where: { user: { isNot: null } }, include: { user: userSelect } },
    Expert:      { where: { user: { isNot: null } }, include: { user: userSelect } },
    Doctor:      { where: { User: { isNot: null } }, include: { User: userSelect } },
    salesAgents: { where: { user: { isNot: null } }, include: { user: userSelect } },
    educators:   { where: { user: { isNot: null } }, include: { user: userSelect } },
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
  };
}
