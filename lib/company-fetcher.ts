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

  return company;
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
      tags: [`company:${cleanIdentifier}`, `company-details:${cleanIdentifier}:${strategy}`], // 👈 Safe primitive variables
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
// // company-fetcher.ts
// import "server-only";
// import { unstable_cache, revalidateTag } from "next/cache";
// import prisma from "@/server/db/prismadb";

// const INCLUDE_MAP = {
//   lean: leanShellInclude(),
//   page: pageDataInclude(),
// };

// /**
//  * 🔍 Base Company Finder (no caching, called inside unstable_cache)
//  * Accepts a simple 'identifier' string which could be a custom domain OR a subdomain slug.
//  */
// async function findCompanyFn(identifier: string, strategy: "lean" | "page") {
//   const include = INCLUDE_MAP[strategy];
//   const normalizedHost = identifier.replace(/^www\./, "").toLowerCase();

//   // 1️⃣ Lookup by custom domain
//   let company = await prisma.company.findFirst({
//     where: {
//       OR: [{ domain: normalizedHost }, { domain: `www.${normalizedHost}` }],
//     },
//     include,
//   });

//   // 2️⃣ Fallback: Lookup by subdomain / slug matching
//   if (!company) {
//     company = await prisma.company.findFirst({
//       where: { slug: normalizedHost },
//       include,
//     });
//   }

//   return company;
// }

// /**
//  * 🧩 Tenant-aware Cached Fetcher
//  * Generates an instantaneous cache match using highly stable string primitives.
//  */
// // company-fetcher.ts

// // ... keep everything else above the same ...

// /**
//  * 🧩 Tenant-aware Cached Fetcher
//  */
// export async function findCompanyCached(
//   identifier: string,
//   strategy: 'lean' | 'page' = 'lean'
// ) {
//   // 1️⃣ Normalize safely up front to guarantee it's a string
//   const cleanIdentifier = (identifier || '')
//     .replace(/^www\./, '')
//     .toLowerCase()
//     .trim();

//   // 2️⃣ Build a stable cache key
//   const key = ['company-details', cleanIdentifier, strategy].join(':');

//   // 3️⃣ Pass the pre-normalized string safely into the tags array
//   const cachedFetcher = unstable_cache(
//     findCompanyFn,
//     [key],
//     {
//       tags: [`company:${cleanIdentifier}`], // 👈 Safe primitive variable
//       revalidate: false,  //
//     }
//   );

//   // 4️⃣ Execute with the safe fallback
//   return cachedFetcher(cleanIdentifier, strategy);
// }

// // /**
// //  * -----------------------------------------------------
// //  * 🧩 Prisma Include Objects
// //  * -----------------------------------------------------
// //  */

// // // Data needed for the main layout (Header, Footer, Context)
// export function leanShellInclude() {
//   return {
//     SEO: true,
//     AnalyticsConfig: true,
//     StoreCategory: {
//       orderBy: { sortOrder: "asc" as const },
//       include: {
//         category: {
//           select: { id: true, name: true, slug: true, image: true, icon: true }
//         }
//       }
//     },
//     Announcement: {
//       orderBy: { publishedAt: "desc" as const },
//       take: 1,
//     },
//     socialLinks: true,
//     policies: true,
//     CompanyLocation: {
//       include: {
//         location: true
//       }
//     },
//   };
// }

// // Data needed for the main content of the page
// export function pageDataInclude() {
//   const userSelect = {
//     select: {
//       id: true,
//       name: true,
//       image: true,
//     },
//   };

//   const orderedAsc = { orderBy: { order: "asc" as const } };

//   return {
//     // Relations for page content
//     blogs: { orderBy: { publishedAt: "desc" as const } },
//     faqs: orderedAsc,
//     testimonials: orderedAsc,
//     heroSlides: orderedAsc,
//     StoreCategory: true,
//     promotions: {
//       select: {
//         title: true, description: true, startsAt: true, endsAt: true, badgeText: true,
//         price: true, ctaText: true, ctaLink: true, bannerUrl: true, featureImage1: true,
//         featureImage2: true, featureImage3: true, perks: true, trustLogos: true,
//       },
//     },
//     PageSection: orderedAsc,
//     Collection: orderedAsc,
//     appPromos: true,
//     marketplaceListings: {
//       take: 12,
//       select: {
//         id: true, name: true, description: true, finalPrice: true, type: true,
//         sellingPrice: true, images: true, pricingTiers: true, isAvailable: true,
//         isFeatured: true, category: true,
//       },
//     },
//     Writer:      { where: { user: { isNot: null } }, include: { user: userSelect } },
//     Expert:      { where: { user: { isNot: null } }, include: { user: userSelect } },
//     Doctor:      { where: { User: { isNot: null } }, include: { User: userSelect } },
//     salesAgents: { where: { user: { isNot: null } }, include: { user: userSelect } },
//     educators:   { where: { user: { isNot: null } }, include: { user: userSelect } },
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
//     PaymentSettings: true,
//     ShippingSettings: true,
//     // Gallery: true,
//   };
// }

// // /**
// //  * -----------------------------------------------------
// //  * ♻️ Revalidation helper (for admin use)
// //  * -----------------------------------------------------
// //  * Call this after updating a company's data in the admin panel.
// //  */
// export async function revalidateCompanyCache(slug: string) {
//   // revalidateTag('companies');      // invalidate all companies
//   revalidateTag(`company:${slug}`); // invalidate this specific company
// }

// export const revalidateStore = (companyId: string) => {
//   revalidateTag(`products-${companyId}`);
//   revalidateTag(`categories-${companyId}`);
//   revalidateTag(`blogs-${companyId}`);
//   revalidateTag(`testimonials-${companyId}`);
//   // console.log(`✨ All caches purged for company: ${companyId}`);
// };



// -------------------------------- this is user the libcache  --------------------------------
// app/api/admin/update-company/route.ts

// import----------server-only";
// import prisma from "@/server/db/prismadb";
// import { cacheGet, cacheSet, cacheDel } from "@/lib/cache"; // Adjust path as needed

// // Define the valid strategies to ensure type safety across the file
// type FetchStrategy = "lean" | "page";

// function getIncludeForCategory(category: string) {
//   switch (category) {
//     case "ecommerce":
//       return {
//         marketplaceListings: true,
//         promotions: true,
//       };

//     case "healthcare":
//       return {
//         Doctor: true,
//         services: true,
//       };

//     case "education":
//       return {
//         educators: true,
//         courses: true,
//       };

//     default:
//       return {};
//   }
// }

// const INCLUDE_MAP = {
//   lean: leanShellInclude(),
//   page: pageDataInclude(),
// };

// /**
//  * 🔍 Base Company Finder (No caching, executed by cache wrapper)
//  * The identifier passed here is already cleaned and normalized by the wrapper.
//  */
// async function findCompanyFn(cleanIdentifier: string, strategy: FetchStrategy) {
//   const include = INCLUDE_MAP[strategy];

//   // 1️⃣ Lookup by custom domain first (checking both raw and www. variants)
//   let company = await prisma.company.findFirst({
//     where: {
//       OR: [{ domain: cleanIdentifier }, { domain: `www.${cleanIdentifier}` }],
//     },
//     include,
//   });

//   // 2️⃣ Fallback: Lookup by subdomain / slug
//   if (!company) {
//     company = await prisma.company.findFirst({
//       where: { slug: cleanIdentifier },
//       include,
//     });
//   }

//   return company;
// }

// /**
//  * 🧩 Tenant-aware Cached Fetcher
//  * Uses local memory cache mapping.
//  */
// export async function findCompanyCached(
//   identifier: string,
//   strategy: FetchStrategy = "lean",
// ) {
//   // 1️⃣ Normalize safely up front to guarantee it's a string
//   const cleanIdentifier = (identifier || "")
//     .replace(/^www\./, "")
//     .toLowerCase()
//     .trim();

//   // 2️⃣ Build a stable cache key
//   const key = `company-details:${cleanIdentifier}:${strategy}`;

//   // 3️⃣ Check memory cache
//   const cachedData = await cacheGet(key);
//   if (cachedData) {
//     return cachedData; // Cache Hit 🎯
//   }

//   // 4️⃣ Cache Miss: Fetch fresh data
//   const company = await findCompanyFn(cleanIdentifier, strategy);

//   // 5️⃣ Populate Cache (Passing 0 triggers your `expiry = null` logic for manual invalidation only)
//   if (company) {
//     await cacheSet(key, company, 0);
//   }

//   return company;
// }

// /**
//  * -----------------------------------------------------
//  * 🧩 Prisma Include Objects
//  * -----------------------------------------------------
//  */

// // Data needed for the main layout (Header, Footer, Context)
// export function leanShellInclude() {
//   return {
//     SEO: true,
//     AnalyticsConfig: true,
//     StoreCategory: {
//       orderBy: { sortOrder: "asc" as const },
//       include: {
//         category: {
//           select: { id: true, name: true, slug: true, image: true, icon: true },
//         },
//       },
//     },
//     Announcement: {
//       orderBy: { publishedAt: "desc" as const },
//       take: 1,
//     },
//     socialLinks: true,
//     policies: true,
//     CompanyLocation: {
//       include: {
//         location: true,
//       },
//     },
//   };
// }

// // Data needed for the main content of the page
// export function pageDataInclude() {
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
//         option: true,
//       },
//     },
//     Writer: { where: { user: { isNot: null } }, include: { user: userSelect } },
//     Expert: { where: { user: { isNot: null } }, include: { user: userSelect } },
//     Doctor: { where: { User: { isNot: null } }, include: { User: userSelect } },
//     salesAgents: {
//       where: { user: { isNot: null } },
//       include: { user: userSelect },
//     },
//     educators: {
//       where: { user: { isNot: null } },
//       include: { user: userSelect },
//     },
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
//     PaymentSettings: true,
//     ShippingSettings: true,
//   };
// }

// /**
//  * -----------------------------------------------------
//  * ♻️ Revalidation helpers (for admin API use)
//  * -----------------------------------------------------
//  */

// // Invalidate the shell/page cache for a specific tenant by slug or domain
// export async function revalidateCompanyCache(identifier: string) {
//   const cleanIdentifier = (identifier || "")
//     .replace(/^www\./, "")
//     .toLowerCase()
//     .trim();
//   // Leverages your custom wildcard RegEx to clear both 'lean' and 'page' strategies
//   await cacheDel(`company-details:${cleanIdentifier}:*`);
// }

// // Invalidate specific data subsets for a tenant
// export async function revalidateStore(companyId: string) {
//   await cacheDel(`products-${companyId}`);
//   await cacheDel(`categories-${companyId}`);
//   await cacheDel(`blogs-${companyId}`);
//   await cacheDel(`testimonials-${companyId}`);
// }
