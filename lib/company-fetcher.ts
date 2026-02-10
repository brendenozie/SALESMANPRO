// company-fetcher.ts
import 'server-only';
import { unstable_cache, revalidateTag } from 'next/cache';
import prisma from '@/server/db/prismadb';

/**
 * -----------------------------------------------------
 * 🔍 Base Company Finder (no caching)
 * -----------------------------------------------------
 */
async function findCompanyFn(
  slug: string,
  requestedHost?: string | null,
  requestedSubdomain?: string | null,
  include?: any
) {
  let company = null;

  // 1️⃣ Lookup by custom domain
  if (requestedHost) {
    const normalizedHost = requestedHost
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .toLowerCase();

    company = await prisma.company.findFirst({
      where: {
        OR: [
          { domain: normalizedHost },
          { domain: `www.${normalizedHost}` },
        ],
      },
      include,
    });
  }

  // 2️⃣ Lookup by subdomain
  if (!company && requestedSubdomain) {
    company = await prisma.company.findFirst({
      where: { slug: requestedSubdomain },
      include,
    });
  }

  // 3️⃣ Fallback to slug
  if (!company) {
    company = await prisma.company.findFirst({
      where: { slug },
      include,
    });
  }

  return company;
}

/**
 * -----------------------------------------------------
 * 🧩 Tenant-aware Cached Fetcher
 * -----------------------------------------------------
 * This builds a unique cache key per tenant (slug, host, subdomain)
 * while still using revalidation tags for instant invalidation.
 */
export async function findCompanyCached(
  slug: string,
  requestedHost?: string | null,
  requestedSubdomain?: string | null,
  include?: any
) {
  // 🪄 Build a stable, tenant-specific cache key
  const key = [
    'company-details',
    slug ?? 'none',
    requestedHost ?? 'none',
    requestedSubdomain ?? 'none',
  ].join(':');

  // ⚙️ Create a cached version of the base fetcher
  const cachedFetcher = unstable_cache(findCompanyFn, [key], {
    tags: [`company:${slug}`], // tag for bulk + per-tenant revalidation
    revalidate: false, // disable auto revalidation; we'll use tag invalidation instead
  });

  return cachedFetcher(slug, requestedHost, requestedSubdomain, include);
}

/**
 * -----------------------------------------------------
 * ♻️ Revalidation helper (for admin use)
 * -----------------------------------------------------
 * Call this after updating a company's data in the admin panel.
 */
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

export const triggerRefresh = {
  products: (companyId: string) => revalidateTag(`products-${companyId}`),
  categories: (catId: string) => revalidateTag(`cat-${catId}`),
  testimonials: (companyId: string) => revalidateTag(`testimonials-${companyId}`),
  blogs: (companyId: string) => revalidateTag(`blogs-${companyId}`),
};

export async function onBlogUpdate(companyId: string) {
  // Clears the cache for just this company's blog list
  revalidateTag(`blogs-${companyId}`);
}

// Call this after prisma.testimonial.create(...)
export async function onNewTestimonial(companyId: string) {
  revalidateTag(`testimonials-${companyId}`);
}

export async function refreshCategoryCache(categoryId?: string, agentId?: string) {
  if (categoryId) revalidateTag(`cat-${categoryId}`);
  if (agentId) revalidateTag(`agent-${agentId}`);
  // Force refresh for anyone looking at "all listings"
  revalidateTag('marketplace-listings');
}

/**
 * Clears the cache for a specific company's product list.
 * Call this inside your Prisma update/create/delete logic.
 */
export async function refreshCompanyProducts(companyId: string) {
  try {
    // 1. Clears the specific data cache we tagged in the API
    revalidateTag(`products-${companyId}`);

    // 2. Optional: Clears the layout/page cache if you have a 
    // frontend route like /marketplace/[companyId]
    // revalidatePath(`/marketplace/${companyId}`);
    
    console.log(`Cache cleared for company: ${companyId}`);
  } catch (error) {
    console.error("Revalidation failed:", error);
  }
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

// import 'server-only';
// // Change the import from 'react' to 'next/cache'
// import { unstable_cache } from 'next/cache';
// import prisma from '@/server/db/prismadb';

// /**
//  * -----------------------------------------------------
//  * 🔍 Cached, Reusable Company Finder
//  * -----------------------------------------------------
//  * Using `unstable_cache` from Next.js for compatibility with older versions.
//  * It de-duplicates data fetches across a single request.
//  */
// const findCompanyFn = async (
//   slug: string,
//   requestedHost?: string | null,
//   requestedSubdomain?: string | null,
//   include?: any
// ) => {
//   let company = null;

//   // 1. Lookup by custom domain
//   if (requestedHost) {
//     const normalizedHost = requestedHost.replace(/^www\./, '').toLowerCase();
//     company = await prisma.company.findFirst({
//       where: {
//         OR: [
//           { domain: normalizedHost },
//           { domain: `www.${normalizedHost}` },
//           { domain: `https://${normalizedHost}` },
//           { domain: `https://www.${normalizedHost}` },
//         ],
//       },
//       include,
//     });
//   }

//   // 2. Lookup by subdomain
//   if (!company && requestedSubdomain) {
//     company = await prisma.company.findFirst({
//       where: { slug: requestedSubdomain },
//       include,
//     });
//   }

//   // 3. Fallback to slug
//   if (!company) {
//     company = await prisma.company.findFirst({
//       where: { slug },
//       include,
//     });
//   }

//   return company;
// };

// // Wrap the function with unstable_cache
// export const findCompany = unstable_cache(
//   findCompanyFn,
//   ['company-details'], // A unique key part for this cache
//   {
//     // You can add revalidation tags if you use on-demand revalidation
//     // tags: ['companies'], 
//   }
// );



// /**
//  * -----------------------------------------------------
//  * 🧩 Prisma Include Objects (No changes here)
//  * -----------------------------------------------------
//  */
// function leanShellIncludeV2() {
//   return {
//     name: true,
//     logoUrl: true,
//     StoreCategory: {
//       select: {
//         category: {
//           select: { name: true },
//         },
//       },
//     },
//     sEO: true, // For metadata
//     SEO: true, // For metadata (legacy casing)
//   };
// }

// export function aboveTheFoldIncludeV2() {
//   const orderedAsc = { orderBy: { order: 'asc' as const } };
//   return {
//     id: true,
//     themeSettings: true,
//     heroSlides: orderedAsc,
//     StoreCategory: {
//       orderBy: { sortOrder: 'asc' as const },
//       include: {
//         category: {
//           select: { id: true, name: true, slug: true, image: true, icon: true },
//         },
//       },
//     },
//     promotions: {
//       take: 1,
//       select: {
//         title: true,
//         description: true,
//         badgeText: true,
//         price: true,
//         ctaText: true,
//         ctaLink: true,
//         bannerUrl: true,
//       },
//     },
//   };
// }

// export function leanShellInclude() {
//   return {
//     // Essential for theme and branding
    
//     // description: true,
//     SEO: true,
//     AnalyticsConfig: true,
    
//     // Navigation categories (needed for header menu)
//     StoreCategory: { 
//       orderBy: { sortOrder: "asc" as const }, 
//       include: { 
//         category: { 
//           select: { id: true, name: true, slug: true, image: true, icon: true } 
//         } 
//       } 
//     },
    
//     // Latest announcement (often shown in header/banner)
//     Announcement: { 
//       orderBy: { publishedAt: "desc" as const },
//       take: 1, // Only get the latest one
//     },
    
//     // Social links for footer
//     socialLinks: true,
    
//     // Policies for footer
//     policies: true,
    
//     // Company locations for footer/contact
//     CompanyLocation: { 
//       include: { 
//         location: true 
//       } 
//     },
//   };
// }

// export function aboveTheFoldInclude() {
//   const userSelect = {
//     select: {
//       id: true,
//       name: true,
//       image: true,
//     },
//   };

//   const orderedAsc = { orderBy: { order: "asc" as const } };

//   return {
//     blogs: { orderBy: { publishedAt: "desc" as const } },
//     faqs: orderedAsc,
//     testimonials: orderedAsc,
//     heroSlides: orderedAsc,

//     StoreCategory: true,

//     promotions: {
//       select: {
//         title: true,
//         description: true,
//         startsAt: true,
//         endsAt: true,
//         badgeText: true,
//         price: true,
//         ctaText: true,
//         ctaLink: true,
//         bannerUrl: true,
//         featureImage1: true,
//         featureImage2: true,
//         featureImage3: true,
//         perks: true,
//         trustLogos: true,
//       },
//     },

//     PageSection: orderedAsc,
//     Collection: orderedAsc,
//     appPromos: true,

//     marketplaceListings: {
//       take: 12,
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         finalPrice: true,
//         type: true,
//         sellingPrice: true,
//         images: true,
//         pricingTiers: true,
//         isAvailable: true,
//         isFeatured: true,
//         category: true,
//       },
//     },

//     // 👇 FIX: Filter out null user relations
//     Writer: {
//       where: { user: { isNot: null } },
//       include: { user: userSelect },
//     },
//     Expert: {
//       where: { user: { isNot: null } },
//       include: { user: userSelect },
//     },
//     Doctor: {
//       where: { User: { isNot: null } }, // Use 'User' (uppercase)
//       include: { User: userSelect },
//     },
//     salesAgents: {
//       where: { user: { isNot: null } },
//       include: { user: userSelect },
//     },
//     educators: {
//       where: { user: { isNot: null } },
//       include: { user: userSelect },
//     },

//     // ✅ Other relations
//     Podcast: true,
//     courses: true,
//     events: true,
//     Package: true,
//     Project: true,
//     services: true,
//     CoreValues: true,

//     CompanyLocation: { include: { location: true } },
//     Destination: true,
//     TourPackage: true,

//     // PricingTiers: true,

//     PaymentSettings: true,
//     ShippingSettings: true,
//   };
// }