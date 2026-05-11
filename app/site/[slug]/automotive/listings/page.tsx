// app/[slug]/automarket/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb';
import Hero from './ProductHero';
import CategoryBar from './ProductCategoryBar';
import Filters from './ProductFilters';
import CarGrid from './ProductCarGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';

type Listing = any; // MarketListingForm-ish

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: {
    page?: string;
    search?: string;
    category?: string; // subcategory id
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function AutoMarketPage({ params, searchParams = {} }: PageProps) {
  const { slug } = await params;
  const {
    page = '1',
    search = '',
    category: selectedCategory = '',
    sort = 'newest',
    minPrice,
    maxPrice,
  } = searchParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = 12;

  // Ensure company/store exists (same approach as products page)
  const baseCompany = await prisma.company.findUnique({ where: { slug } });
  if (!baseCompany) notFound();

  // 1) Try to find the parent "Automarket" category by slug
  //    If there's a category with slug 'automarket', use it, else try to find by name fallback
  let parentCategory = await prisma.productCategory.findUnique({
    where: { slug: 'automarket' },
    // include: {
    //   subcategories: true,
    // },
  });

  if (!parentCategory) {
    parentCategory = await prisma.productCategory.findFirst({
      where: {
        name: { contains: 'auto', mode: 'insensitive' },
      },
      // include: {
      //   subcategories: true,
      // },
    });
  }

  
  // Build listings query
  const where: any = {
    companyId: baseCompany.id,
    // Ensure the listing is an auto-related listing - we will filter by productCategoryId
  };

    // If still not found, fallback to top-level categories (empty subcategories)
  const rawSubcategories = parentCategory?.subcategories;
  const subcategories = Array.isArray(rawSubcategories) ? rawSubcategories.map((s: any) => ({
    id: s.id,
    name: s.name,
    slug: s.slug ?? s.id,
    icon: s.icon ?? null,
  })) : [];

  if (selectedCategory) {
    where.productCategoryId = selectedCategory;
  } 
  // else if (parentCategory) {
  //   const childIds =
  //     subcategories
  //       ?.map((s: any) => s?.id)
  //       ?.filter(Boolean) ?? [];

  //   const candidateCategoryIds = [
  //     parentCategory.id,
  //     ...childIds,
  //   ];

  //   where.productCategoryId = {
  //     in: candidateCategoryIds,
  //   };
  // }  

  // Simple text search on make, model, name fields (best-effort; adjust to your schema)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { make: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // price filters
  if (minPrice || maxPrice) {
    where.finalPrice = {};
    if (minPrice) where.finalPrice.gte = Number(minPrice);
    if (maxPrice) where.finalPrice.lte = Number(maxPrice);
  }

  // sort
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'priceAsc') orderBy = { finalPrice: 'asc' };
  if (sort === 'priceDesc') orderBy = { finalPrice: 'desc' };
  if (sort === 'mileage') orderBy = { mileage: 'asc' };

  // Fetch listings and count
  const [listings, totalCount] = await Promise.all([
    prisma.marketplaceListings.findMany({
      where,
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      orderBy,
    }),
    prisma.marketplaceListings.count({ where }),
  ]);

  // Map DB listing to UI-friendly car object (best-effort mapping)
  const cars = listings.map((p: any) => {
    const imageUrl = Array.isArray(p.images) && p.images.length > 0 ? (p.images[0]?.url ?? p.images[0]) : null;
    return {
      id: p.id,
      make: p.make ?? p.name?.split?.(' ')?.[0] ?? 'Unknown',
      model: p.model ?? p.name ?? '',
      year: p.year ?? p.startDealDate ? Number(new Date(p.startDealDate).getFullYear()) : null,
      price: p.finalPrice ?? p.sellingPrice ?? p.buyingPrice ?? 0,
      mileage: Number(p.mileage ?? 0),
      transmission: p.transmission ?? p.type ?? 'Automatic',
      fuel: p.fuelType ?? p.fuel ?? 'Unknown',
      type: p.productCategory?.slug ?? p.type ?? (p.productCategoryId ?? ''),
      location: p.locationName ?? (p.location?.city ?? p.location ?? 'Unknown'),
      images: Array.isArray(p.images) ? p.images.map((i: any) => i?.url ?? i) : [],
      badges: [
        p.isFeatured ? 'Featured' : null,
        p.isNewArrival ? 'New Arrival' : null,
        p.isOnOffer ? 'Special Offer' : null,
        p.badge ?? null,
      ].filter(Boolean),
      specs: {
        hp: p.horsepower ? `${p.horsepower} hp` : undefined,
        '0-60': p.acceleration ?? undefined,
        range: p.fuelEconomy ?? undefined,
        drive: p.drive ?? undefined,
      },
      productCategoryId: p.productCategoryId ?? null,
      slug: p.slug ?? '',
    };
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  

  return (
    <div className="min-h-screen bg-slate-50">
      <Hero />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header + Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Current Inventory</h2>
            <p className="text-slate-500 mt-1">Showing {totalCount} vehicles available for immediate delivery.</p>
          </div>

          {/* Filters (client) */}
          <Filters
            slug={slug}
            current={{ page: pageNum, search, category: selectedCategory, sort, minPrice: minPrice ?? '', maxPrice: maxPrice ?? '' }}
            parentCategory={parentCategory ? { id: parentCategory.id, name: parentCategory.name } : null}
            subcategories={subcategories}
          />
        </div>

        {/* Category bar (subcategories as pills) */}
        <CategoryBar
          categories={subcategories}
          parent={parentCategory ? { id: parentCategory.id, name: parentCategory.name } : null}
          currentCategory={selectedCategory}
          slug={slug}
        />

        {/* Grid */}
        <div className="mt-8">
          <CarGrid cars={cars} />
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2 mt-10">
          <a
            href={`/automotive/listings?page=${pageNum - 1}&search=${encodeURIComponent(search)}&category=${selectedCategory}&sort=${sort}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}`}
            className={`px-3 py-1 border rounded ${pageNum <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Previous
          </a>

          {Array.from({ length: totalPages }, (_, i) => (
            <a
              key={i}
              href={`/automotive/listings?page=${i + 1}&search=${encodeURIComponent(search)}&category=${selectedCategory}&sort=${sort}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}`}
              className={`px-3 py-1 border rounded ${i + 1 === pageNum ? 'bg-gray-200' : ''}`}
            >
              {i + 1}
            </a>
          ))}

          <a
            href={`/automotive/listings?page=${pageNum + 1}&search=${encodeURIComponent(search)}&category=${selectedCategory}&sort=${sort}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}`}
            className={`px-3 py-1 border rounded ${pageNum >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Next
          </a>
        </div>

        {/* CTA Banner */}
        <div className="mt-20 bg-blue-600 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent transform skew-x-12"></div>
          <div className="px-8 py-12 md:px-16 md:py-16 flex flex-col md:flex-row items-center justify-between relative z-10">
            <div className="text-center md:text-left mb-8 md:mb-0 max-w-lg">
              <h3 className="text-3xl font-bold text-white mb-4">Have a car to trade?</h3>
              <p className="text-blue-100 text-lg">Get an instant offer on your current vehicle. We pay top dollar for well-maintained sports and luxury cars.</p>
            </div>
            <a href={`/${slug}/trade`} className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold shadow-xl transition-colors flex items-center gap-2">
              Get Instant Offer
            </a>
          </div>
        </div>
      </main>

      <NewsletterSection />
    </div>
  );
}
