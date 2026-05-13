// app/[slug]/automarket/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/server/db/prismadb";
import { loadStore } from "@/lib/loadStore";
import { Prisma } from "@prisma/client";

import Hero from "./ProductHero";
import CategoryBar from "./ProductCategoryBar";
import Filters from "./ProductFilters";
import CarGrid from "./ProductCarGrid";
import NewsletterSection from "@/components/site/NewsletterSection/NewsletterSection";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
  searchParams?: {
    page?: string;
    search?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function AutoMarketPage({
  params,
  searchParams = {},
}: PageProps) {
  const { slug } = params;

  /* --------------------------------------------------
   * 1. Load Store (same pattern as listings page)
   * -------------------------------------------------- */
  const { raw: store } = await loadStore(slug);
  if (!store) notFound();

  const companyId = store.id;

  /* --------------------------------------------------
   * 2. Parse query params
   * -------------------------------------------------- */
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const pageSize = 12;

  const search = searchParams.search?.trim();
  const selectedCategory = searchParams.category;
  const sort = searchParams.sort || "newest";
  const minPrice = searchParams.minPrice;
  const maxPrice = searchParams.maxPrice;

  /* --------------------------------------------------
   * 3. Fetch Automarket parent + subcategories
   * -------------------------------------------------- */
  const parentCategory = await prisma.storeCategory.findFirst({
    where: {
      companyId,
      // slug: "automarket",
      visible: true,
    },
    // include: {
    //   subcategories: {
    //     where: { visible: true },
    //     orderBy: { sortOrder: "asc" },
    //   },
    // },
  });

  const subcategories =
    parentCategory?.subcategories?.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      icon: s.icon ?? null,
    })) ?? [];

  /* --------------------------------------------------
   * 4. Build Prisma WHERE clause (mirrors listings page)
   * -------------------------------------------------- */
  const whereClause: Prisma.marketplaceListingsWhereInput = {
    companyId,

    ...(selectedCategory && {
      subCategoryId: selectedCategory,
    }),

    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),

    ...((minPrice || maxPrice) && {
      finalPrice: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined,
      },
    }),
  };

  /* --------------------------------------------------
   * 5. Sorting
   * -------------------------------------------------- */
  let orderBy: Prisma.marketplaceListingsOrderByWithRelationInput = {
    createdAt: "desc",
  };

  if (sort === "priceAsc") orderBy = { finalPrice: "asc" };
  if (sort === "priceDesc") orderBy = { finalPrice: "desc" };
  if (sort === "mileage") orderBy = { mileage: "asc" };

  /* --------------------------------------------------
   * 6. Fetch data in parallel
   * -------------------------------------------------- */
  const [listings, totalCount] = await Promise.all([
    prisma.marketplaceListings.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
    }),
    prisma.marketplaceListings.count({ where: whereClause }),
  ]);

  /* --------------------------------------------------
   * 7. Map listings → UI car model
   * -------------------------------------------------- */
  const cars = listings.map((p) => ({
    id: p.id,
    make: p.make ?? p.name?.split(" ")[0] ?? "Unknown",
    model: p.model ?? p.name ?? "",
    year: p.year ?? null,
    price: p.finalPrice ?? 0,
    mileage: Number(p.mileage ?? 0),
    transmission: p.transmission ?? "Automatic",
    fuel: p.fuelType ?? "Unknown",
    type: p.type ?? "",
    location: p.locationName ?? "Unknown",
    images: Array.isArray(p.images)
      ? p.images.map((i: any) => i?.url ?? i)
      : [],
    badges: [
      p.isFeatured && "Featured",
      p.isNewArrival && "New Arrival",
      p.isOnOffer && "Special Offer",
    ].filter(Boolean),
    // slug: p.slug ?? "",
    productCategoryId: p.productCategoryId ?? null,
  }));

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  /* --------------------------------------------------
   * 8. Render
   * -------------------------------------------------- */
  return (
    <div className="min-h-screen bg-slate-50">
      <Hero />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header + Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Current Inventory
            </h2>
            <p className="text-slate-500 mt-1">
              Showing {totalCount} vehicles available.
            </p>
          </div>

          <Filters
            slug={slug}
            current={{
              page,
              search: search ?? "",
              category: selectedCategory ?? "",
              sort,
              minPrice: minPrice ?? "",
              maxPrice: maxPrice ?? "",
            }}
            parentCategory={
              parentCategory
                ? { id: parentCategory.id, name: parentCategory.displayName }
                : null
            }
            subcategories={subcategories}
          />
        </div>

        <CategoryBar
          categories={subcategories}
          parent={
            parentCategory
              ? { id: parentCategory.id, name: parentCategory.displayName }
              : null
          }
          currentCategory={selectedCategory}
          slug={slug}
        />

        <div className="mt-8">
          <CarGrid cars={cars} />
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-10 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <a
              key={i}
              href={`/automotive/listings?page=${i + 1}`}
              className={`px-3 py-1 border rounded ${
                i + 1 === page ? "bg-gray-200" : ""
              }`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      </main>

      <NewsletterSection />
    </div>
  );
}