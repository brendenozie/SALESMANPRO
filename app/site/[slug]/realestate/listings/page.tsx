import prisma from "@/server/db/prismadb";
import { loadStore } from "@/lib/loadStore";
import ListingsClient from "./listingsClient";
// import HeroSection from "./HeroSection";
import { Prisma } from "@prisma/client";
import HeroSection from "./HeroSection";

export const dynamic = "force-dynamic";

interface ProductListPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | undefined };
}

export default async function ProductListPage({
  params,
  searchParams,
}: ProductListPageProps) {
  const { slug } = params;
  
  // 1. Load Tenant Data
  const { raw: store } = await loadStore(slug);
  const companyId = store.id;

  // 2. Parse Search Params
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 12;
  
  // Build Dynamic Filters
  const whereClause: Prisma.marketplaceListingsWhereInput = {
    companyId,
    // Filter by Category
    ...(searchParams.category && {
      categoryId: searchParams.category,
    }),
    // Filter by Subcategory
    ...(searchParams.subcategory && {
      subCategoryId: searchParams.subcategory,
    }),
    // Filter by Price Range
    ...((searchParams.minPrice || searchParams.maxPrice) && {
      finalPrice: {
        gte: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
        lte: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
      },
    }),
    // Filter by Location (Case insensitive search)
    ...(searchParams.location && {
      locationName: { contains: searchParams.location, mode: "insensitive" },
    }),
  };

  
  // 3. Parallel Data Fetching
  const [categories, listings, totalCount] = await Promise.all([
    prisma.storeCategory.findMany({
      where: { companyId, visible: true },
      // include: { ProductCategory: true }, // Include subs for the dropdown
      orderBy: { sortOrder: "asc" },
    }),

    prisma.marketplaceListings.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      // Select only what we need for the card to be efficient
      select: {
        id: true,
        name: true,
        finalPrice: true,
        sellingPrice: true,
        images: true,
        locationName: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        // badge: true,
        isFeatured: true,
        createdAt: true,
      },
    }),

    prisma.marketplaceListings.count({ where: whereClause }),
  ]);

  return (
    <main className="w-full min-h-screen bg-gray-50">
      {/* Pass store data to Hero for slides */}
      {/* <HeroSection 
        store={store as any} 
        categories={categories} 
      /> */}

      {/* Client Component for the Grid & Pagination */}
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