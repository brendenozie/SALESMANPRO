import prisma from "@/server/db/prismadb";
import { loadStore } from "@/lib/loadStore";
import ListingsClient from "./ListingsClient";
import { Prisma } from "@prisma/client";
import HeroSectionWrapper from "./HeroSectionWrapper";
import { findCompanyCached } from "@/lib/company-fetcher";

import { notFound } from 'next/navigation';

export const revalidate = 60;

interface ProductListPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | undefined };
}

// app/[slug]/listings/page.tsx (Example path)
export default async function ProductListPage({ params, searchParams, }: ProductListPageProps) {

  const { slug } = params;
  const baseCompany = await findCompanyCached(slug, "lean");

  if (!baseCompany) notFound();
  
  const companyId = baseCompany.id;

  // 1. Parse Search Params (already have this, but let's ensure types)
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 12;

  const whereClause: Prisma.marketplaceListingsWhereInput = {
  companyId,

  // ✅ Product Category (ObjectId)
  ...(searchParams.categoryId && {
    productCategoryId: searchParams.categoryId,
  }),

  // ✅ Category (string / enum-like)
  ...(searchParams.category && {
    category: searchParams.category,
  }),

  // ✅ Subcategory (by name – NOT Json)
  ...(searchParams.subcategory && {
    subCategoryName: {
      equals: searchParams.subcategory,
      mode: "insensitive",
    },
  }),

  // ✅ Price Range
  ...((searchParams.minPrice || searchParams.maxPrice) && {
    finalPrice: {
      gte: searchParams.minPrice
        ? Number(searchParams.minPrice)
        : undefined,
      lte: searchParams.maxPrice
        ? Number(searchParams.maxPrice)
        : undefined,
    },
  }),

  // ✅ Location search (denormalized string)
  ...(searchParams.location && {
    locationName: {
      contains: searchParams.location,
      mode: "insensitive",
    },
  }),

  // ✅ Only active listings (recommended)
  status: "ACTIVE",
};


  // 2. Fetch Data
  const [categories, listings, totalCount, companyLocations ] = await Promise.all([
    prisma.storeCategory.findMany({
      where: { companyId, visible: true },
      // include: { subcategories: true }, // IMPORTANT: Load subcategories for the Hero dropdowns
      orderBy: { sortOrder: "asc" },
    }),
    prisma.marketplaceListings.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.marketplaceListings.count({ where: whereClause }),
    prisma.companyLocation.findMany({
      where: { companyId },
      include: {
        location: true, // Assuming you have a relation to a Location model for details
      },
      // orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 ">
      {/* 3. Pass the categories and the search handler to the Hero */}
      <HeroSectionWrapper 
        store={store as any} 
        categories={categories}
        // initialLocations={
        //   Array.isArray(companyLocations)
        //     ? companyLocations.map((cl: any) => {
        //         // Fallback logic: Use the nested location object, or the join record itself
        //         const data = cl.location || cl; 
                
        //         return {
        //           id: data.id,
        //           name: data.name || "Unknown Location",
        //           // Use the slug if it exists, otherwise create one from the name
        //           slug: data.slug || data.name?.toLowerCase().trim().replace(/\s+/g, "-") || "",
        //           status: data.status || "active",
        //           ...data, // Spread remaining fields
        //         };
        //       }).filter(loc => loc.name && loc.slug) // Filter out any broken records
        //     : []
        // }
      initialLocations={
          companyLocations
            .map((cl) => {
              if (!cl.location) return null;

              return {
                id: cl.location.id,
                name: cl.location.name,
                slug: cl.location.slug,
                status: cl.location.status ?? "active",
              };
            })
            .filter(Boolean)
        }
        slug={slug} 
      />

      <div id="listings-section" className="scroll-mt-20">
        <ListingsClient
          companyId={companyId}
          initialListings={listings}
          totalCount={totalCount}
          pageSize={pageSize}
          currentPage={page}
        />
      </div>
    </main>
  );
}