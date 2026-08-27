import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheGet, cacheSet } from "@/lib/cache";
import { ListingStatus } from "@prisma/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const JSON_HEADER = {
  "Content-Type": "application/json",
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  ...CORS_HEADERS,
};

const listingSelect = {
  discount: true,
  isFeatured: true,
  isFlashDeal: true,
  isDiscounted: true,
  isNewArrival: true,
  category: true,
  subCategoryName: true,
  brand: true,
  productCategoryId: true,
  id: true,
  sellingPrice: true,
  finalPrice: true,
  createdAt: true,
  // If you need flags:
  name: true,
  images: true,
  isAvailable: true,
  isOnOffer: true,
  option: true,
  // Nested selection instead of full 'include'
  product: {
    select: {
      id: true,
      // name: true,
      // image: true,
      // slug: true,
    },
  },
};

const listingWhere = {
  status: "ACTIVE" as ListingStatus,
  isAvailable: true,
  ghubaAdminApproved: true,
  ghubaStatus: "APPROVED",
};

async function getHandler() {
  try {
    const cacheKey = "shop:homepage:v2";

    const cached = await cacheGet(cacheKey);

    if (cached) {
      return NextResponse.json(cached, {
        headers: JSON_HEADER,
      });
    }

    //---------------------------------------------------------
    // Categories
    //---------------------------------------------------------

    const categories = await prisma.productCategory.findMany({
      where: {
        visible: true,
      },
      orderBy: [
        {
          isFeatured: "desc",
        },
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
      take: 12,
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        icon: true,
        isFeatured: true,
        allBrands: true,
      },
    });

    const featuredCategory = categories.find((c) => c.isFeatured) ?? null;

    //---------------------------------------------------------
    // Homepage Sections
    //---------------------------------------------------------

    const [
      flashDeals,
      newArrivals,
      discounts,
      featured,
      featuredCategoryProducts,
    ] = await Promise.all([
      prisma.marketplaceListings.findMany({
        where: {
          ...listingWhere,
          isFlashDeal: true,
        },
        take: 12,
        orderBy: {
          createdAt: "desc",
        },
        select: listingSelect,
      }),

      prisma.marketplaceListings.findMany({
        where: {
          ...listingWhere,
          isNewArrival: true,
        },
        take: 12,
        orderBy: {
          createdAt: "desc",
        },
        select: listingSelect,
      }),

      prisma.marketplaceListings.findMany({
        where: {
          ...listingWhere,
          isDiscounted: true,
        },
        take: 12,
        orderBy: {
          createdAt: "desc",
        },
        select: listingSelect,
      }),

      prisma.marketplaceListings.findMany({
        where: {
          ...listingWhere,
          isFeatured: true,
        },
        take: 12,
        orderBy: {
          createdAt: "desc",
        },
        select: listingSelect,
      }),

      featuredCategory
        ? prisma.marketplaceListings.findMany({
            where: {
              ...listingWhere,
              productCategoryId: featuredCategory.id,
            },
            take: 12,
            orderBy: {
              createdAt: "desc",
            },
            select: listingSelect,
          })
        : Promise.resolve([]),
    ]);

    //---------------------------------------------------------
    // Response
    //---------------------------------------------------------

    const response = {
      generatedAt: new Date().toISOString(),

      categories,

      featuredCategory,

      sections: {
        featured,

        flashDeals,

        newArrivals,

        discounts,

        featuredCategoryProducts,
      },
    };

    await cacheSet(cacheKey, response, 300);

    return NextResponse.json(response, {
      headers: JSON_HEADER,
    });
  } catch (error) {
    console.error("Homepage API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load homepage.",
      },
      {
        status: 500,
      },
    );
  }
}

export const GET = withApiHandler(getHandler, {
  requireAuth: false,
  requireRateLimit: true,
});

// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { cacheGet, cacheSet } from "@/lib/cache";

// const CORS_HEADERS = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// const JSON_HEADER = {
//   "Content-Type": "application/json",
//   "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
//   ...CORS_HEADERS,
// };

// async function getHandler(request: Request) {
//   try {
//     const cacheKey = "shop:homepage";
//     const cached = await cacheGet(cacheKey);

//     if (cached) {
//       return NextResponse.json(cached, { headers: JSON_HEADER });
//     }

//     // STEP 1: Fetch categories first to determine which one is featured
//     const categories = await prisma.productCategory.findMany({
//       take: 12,
//       orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
//       select: {
//         id: true,
//         name: true,
//         slug: true,
//         image: true,
//         icon: true,
//         isFeatured: true,
//         allBrands: true,
//       },
//     });

//     const featuredCategory =  categories.find((c) => c.isFeatured) || categories[0];

//     // STEP 2: Fetch products concurrently using Promise.all for maximum speed
//     const [
//       flashDeals,
//       newArrivals,
//       discounts,
//       featured,
//       featuredCategoryProducts,
//     ] = await Promise.all([
//       prisma.marketplaceListings.findMany({
//         where: { isFlashDeal: true },
//         take: 12,
//         orderBy: { createdAt: "desc" },
//         select: {
//           id: true,
//           name: true,
//           images: true,
//           finalPrice: true,
//           sellingPrice: true,
//         },
//       }),
//       prisma.marketplaceListings.findMany({
//         where: { isNewArrival: true },
//         take: 12,
//         orderBy: { createdAt: "desc" },
//         select: {
//           id: true,
//           name: true,
//           images: true,
//           finalPrice: true,
//           sellingPrice: true,
//         },
//       }),
//       prisma.marketplaceListings.findMany({
//         where: { isDiscounted: true },
//         take: 12,
//         orderBy: { createdAt: "desc" },
//         select: {
//           id: true,
//           name: true,
//           images: true,
//           finalPrice: true,
//           sellingPrice: true,
//         },
//       }),
//       prisma.marketplaceListings.findMany({
//         where: { isFeatured: true },
//         take: 12,
//         orderBy: { createdAt: "desc" },
//         select: {
//           id: true,
//           name: true,
//           images: true,
//           finalPrice: true,
//           sellingPrice: true,
//         },
//       }),
//       // FIX: Now we correctly filter by the specific featured category
//       prisma.marketplaceListings.findMany({
//         where: featuredCategory ? { category: featuredCategory.id } : {}, // NOTE: Ensure 'categoryId' matches your Prisma schema
//         take: 12,
//         orderBy: { createdAt: "desc" },
//         select: {
//           id: true,
//           name: true,
//           images: true,
//           finalPrice: true,
//           sellingPrice: true,
//         },
//       }),
//     ]);

//     const response = {
//       categories,
//       flashDeals,
//       newArrivals,
//       discounts,
//       featured,
//       featuredCategoryProducts,
//     };

//     await cacheSet(cacheKey, response, 300);

//     return NextResponse.json(response, { headers: JSON_HEADER });
//   } catch (error) {
//     console.error("Homepage Fetch Error:", error);
//     return NextResponse.json({ error: "Internal Error" }, { status: 500 });
//   }
// }

// export const GET = withApiHandler(getHandler, {
//   requireAuth: false,
//   requireRateLimit: true,
// });

// // // app/api/shop/homepage/route.ts

// // import { NextResponse } from "next/server";
// // import prisma from "@/server/db/prismadb";
// // import { withApiHandler } from "@/lib/hooks/withApiHandler";
// // import { cacheGet, cacheSet } from "@/lib/cache";

// // const CORS_HEADERS = {
// //   "Access-Control-Allow-Origin": "*",
// //   "Access-Control-Allow-Methods": "GET, OPTIONS",
// //   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// // };

// // // Optimization: Pre-calculate headers
// // const JSON_HEADER = { "Content-Type": "application/json","Cache-Control": "public, s-maxage=60, stale-while-revalidate=300", ...CORS_HEADERS };

// // async function getHandler(request: Request) {
// //   try {
// //     const cacheKey = "shop:homepage";

// //     const cached = await cacheGet(cacheKey);

// //     if (cached) {
// //       return NextResponse.json(cached, {
// //         headers: JSON_HEADER,
// //       });
// //     }

// //     const [
// //       categories,
// //       flashDeals,
// //       newArrivals,
// //       discounts,
// //       featured,
// //       featuredCategoryProducts,
// //     ] = await prisma.$transaction([
// //       prisma.productCategory.findMany({
// //         take: 12,
// //         orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
// //         select: {
// //           id: true,
// //           name: true,
// //           slug: true,
// //           image: true,
// //           icon: true,
// //           isFeatured: true,
// //           allBrands: true,
// //         },
// //       }),

// //       prisma.marketplaceListings.findMany({
// //         where: {
// //           isFlashDeal: true,
// //         },
// //         take: 12,
// //         orderBy: {
// //           createdAt: "desc",
// //         },
// //         select: {
// //           id: true,
// //           name: true,
// //           images: true,
// //           finalPrice: true,
// //           sellingPrice: true,
// //         },
// //       }),

// //       prisma.marketplaceListings.findMany({
// //         where: {
// //           isNewArrival: true,
// //         },
// //         take: 12,
// //         orderBy: {
// //           createdAt: "desc",
// //         },
// //         select: {
// //           id: true,
// //           name: true,
// //           images: true,
// //           finalPrice: true,
// //           sellingPrice: true,
// //         },
// //       }),

// //       prisma.marketplaceListings.findMany({
// //         where: {
// //           isDiscounted: true,
// //         },
// //         take: 12,
// //         orderBy: {
// //           createdAt: "desc",
// //         },
// //         select: {
// //           id: true,
// //           name: true,
// //           images: true,
// //           finalPrice: true,
// //           sellingPrice: true,
// //         },
// //       }),

// //       prisma.marketplaceListings.findMany({
// //         where: {
// //           isFeatured: true,
// //         },
// //         take: 12,
// //         orderBy: {
// //           createdAt: "desc",
// //         },
// //         select: {
// //           id: true,
// //           name: true,
// //           images: true,
// //           finalPrice: true,
// //           sellingPrice: true,
// //         },
// //       }),

// //       prisma.marketplaceListings.findMany({
// //         take: 12,
// //         orderBy: {
// //           createdAt: "desc",
// //         },
// //         select: {
// //           id: true,
// //           name: true,
// //           images: true,
// //           finalPrice: true,
// //           sellingPrice: true,
// //         },
// //       }),
// //     ]);

// //     const response = {
// //       categories,
// //       flashDeals,
// //       newArrivals,
// //       discounts,
// //       featured,
// //       featuredCategoryProducts,
// //     };

// //     await cacheSet(cacheKey, response, 300);

// //     return NextResponse.json(response, {
// //       headers: JSON_HEADER,
// //     });
// //   } catch (error) {
// //     return NextResponse.json({ error: "Internal Error" }, { status: 500 });
// //   }
// // }

// // export const GET = withApiHandler(getHandler, {
// //   requireAuth: false,
// //   requireRateLimit: true,
// // });
