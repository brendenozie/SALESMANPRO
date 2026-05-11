import prisma from "@/server/db/prismadb";
import { loadStore } from "@/lib/loadStore";
import ListingsClient from "./ListingsClient";
// import HeroSection from "./HeroSection";
import { Prisma } from "@prisma/client";
import HeroSectionWrapper from "./HeroSectionWrapper";

export const dynamic = "force-dynamic";

interface ProductListPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | undefined };
}

// export default async function ProductListPage({
//   params,
//   searchParams,
// }: ProductListPageProps) {
//   const { slug } = params;
  
//   // 1. Load Tenant Data
//   const { raw: store } = await loadStore(slug);
//   const companyId = store.id;

//   // 2. Parse Search Params
//   const page = parseInt(searchParams.page || "1", 10);
//   const pageSize = 12;
  
//   // Build Dynamic Filters
//   const whereClause: Prisma.marketplaceListingsWhereInput = {
//     companyId,
//     // Filter by Category
//     ...(searchParams.category && {
//       categoryId: searchParams.category,
//     }),
//     // Filter by Subcategory
//     ...(searchParams.subcategory && {
//       subCategoryId: searchParams.subcategory,
//     }),
//     // Filter by Price Range
//     ...((searchParams.minPrice || searchParams.maxPrice) && {
//       finalPrice: {
//         gte: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
//         lte: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
//       },
//     }),
//     // Filter by Location (Case insensitive search)
//     ...(searchParams.location && {
//       locationName: { contains: searchParams.location, mode: "insensitive" },
//     }),
//   };

  
//   // 3. Parallel Data Fetching
//   const [categories, listings, totalCount] = await Promise.all([
//     prisma.storeCategory.findMany({
//       where: { companyId, visible: true },
//       // include: { ProductCategory: true }, // Include subs for the dropdown
//       orderBy: { sortOrder: "asc" },
//     }),

//     prisma.marketplaceListings.findMany({
//       where: whereClause,
//       skip: (page - 1) * pageSize,
//       take: pageSize,
//       orderBy: { createdAt: "desc" },
//       // Select only what we need for the card to be efficient
//       select: {
//         id: true,
//         name: true,
//         finalPrice: true,
//         sellingPrice: true,
//         images: true,
//         locationName: true,
//         bedrooms: true,
//         bathrooms: true,
//         area: true,
//         // badge: true,
//         isFeatured: true,
//         createdAt: true,
//       },
//     }),

//     prisma.marketplaceListings.count({ where: whereClause }),
//   ]);

//   return (
//     <main className="w-full min-h-screen bg-gray-50">
//       {/* Pass store data to Hero for slides */}
//       {/* <HeroSection 
//         store={store as any} 
//         categories={categories} 
//       /> */}

//       {/* Client Component for the Grid & Pagination */}
//       <div id="listings-section" className="scroll-mt-20">
//         <ListingsClient
//           initialListings={listings}
//           totalCount={totalCount}
//           pageSize={pageSize}
//           currentPage={page}
//         />
//       </div>
//     </main>
//   );
// }

// app/[slug]/listings/page.tsx (Example path)
// export default async function ProductListPage({ params, searchParams }: ProductListPageProps) {
//   const { slug } = params;
//   const { raw: store } = await loadStore(slug);
//   const companyId = store.id;

//   // 1. Parse Search Params (already have this, but let's ensure types)
//   const page = parseInt(searchParams.page || "1", 10);
//   const pageSize = 12;

//   const whereClause: Prisma.marketplaceListingsWhereInput = {
//     companyId,
//     ...(searchParams.category && { categoryId: searchParams.category }),
//     ...(searchParams.subcategory && { subCategoryId: searchParams.subcategory }),
//     ...((searchParams.minPrice || searchParams.maxPrice) && {
//       finalPrice: {
//         gte: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
//         lte: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
//       },
//     }),
//     ...(searchParams.location && {
//       locationName: { contains: searchParams.location, mode: "insensitive" },
//     }),
//   };

//   // 2. Fetch Data
//   const [categories, listings, totalCount] = await Promise.all([
//     prisma.storeCategory.findMany({
//       where: { companyId, visible: true },
//       // include: { subcategories: true }, // IMPORTANT: Load subcategories for the Hero dropdowns
//       orderBy: { sortOrder: "asc" },
//     }),
//     prisma.marketplaceListings.findMany({
//       where: whereClause,
//       skip: (page - 1) * pageSize,
//       take: pageSize,
//       orderBy: { createdAt: "desc" },
//     }),
//     prisma.marketplaceListings.count({ where: whereClause }),
//   ]);

//   return (
//     <main className="w-full min-h-screen bg-gray-50">
//       {/* 3. Pass the categories and the search handler to the Hero */}
//       <HeroSection 
//         store={store as any} 
//         categories={categories} 
//         // slug={slug} 
//       />

//       <div id="listings-section" className="scroll-mt-20">
//         <ListingsClient
//           initialListings={listings}
//           totalCount={totalCount}
//           pageSize={pageSize}
//           currentPage={page}
//         />
//       </div>
//     </main>
//   );
// }


// app/[slug]/listings/page.tsx (Example path)
export default async function ProductListPage({ params, searchParams }: ProductListPageProps) {
  const { slug } = params;
  const { raw: store } = await loadStore(slug);
  const companyId = store.id;

  // 1. Parse Search Params (already have this, but let's ensure types)
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 12;

  const whereClause: Prisma.marketplaceListingsWhereInput = {
    companyId,
    ...(searchParams.category && { categoryId: searchParams.category }),
    ...(searchParams.subcategory && { subCategoryId: searchParams.subcategory }),
    ...((searchParams.minPrice || searchParams.maxPrice) && {
      finalPrice: {
        gte: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
        lte: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
      },
    }),
    ...(searchParams.location && {
      locationName: { contains: searchParams.location, mode: "insensitive" },
    }),
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
    <main className="w-full min-h-screen bg-gray-50">
      {/* 3. Pass the categories and the search handler to the Hero */}
      <HeroSectionWrapper 
        store={store as any} 
        categories={categories}
        initialLocations={
        Array.isArray(companyLocations)
          ? companyLocations.map((cl: any) => {
              // Fallback logic: Use the nested location object, or the join record itself
              const data = cl.location || cl; 
              
              return {
                id: data.id,
                name: data.name || "Unknown Location",
                // Use the slug if it exists, otherwise create one from the name
                slug: data.slug || data.name?.toLowerCase().trim().replace(/\s+/g, "-") || "",
                status: data.status || "active",
                ...data, // Spread remaining fields
              };
            }).filter(loc => loc.name && loc.slug) // Filter out any broken records
          : []
      }
        slug={slug} 
      />

      <div id="listings-section" className="scroll-mt-20">
        <ListingsClient
          initialListings={listings}
          totalCount={totalCount}
          pageSize={pageSize}
          currentPage={page}
        />
      </div>
    </main>
  );
}