// app/[slug]/automarket/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb';
import Hero from './ProductHero';
import CategoryBar from './ProductCategoryBar';
import Filters from './ProductFilters';
import CarGrid from './ProductCarGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';

type Listing = any; // MarketListingForm-ish

interface PageProps {
  params: { slug: string };
  searchParams?: {
    page?: string;
    search?: string;
    category?: string; // subcategory id
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export const revalidate = 60;

export default async function AutoMarketPage({ params, searchParams = {} }: PageProps) {
  const { slug } = params;
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
    // include: { subcategories: true },
  });

  if (!parentCategory) {
    parentCategory = await prisma.productCategory.findFirst({
      where: { name: { contains: 'auto', mode: 'insensitive' } },
      // include: { subcategories: true },
    });
  }

  // If still not found, fallback to top-level categories (empty subcategories)
  const rawSubcategories = parentCategory?.subcategories;
  const subcategories = Array.isArray(rawSubcategories) ? rawSubcategories.map((s: any) => ({
    id: s.id,
    name: s.name,
    slug: s.slug ?? s.id,
    icon: s.icon ?? null,
  })) : [];

  // Build listings query
  const where: any = {
    companyId: baseCompany.id,
    // Ensure the listing is an auto-related listing - we will filter by productCategoryId
  };

  if (selectedCategory) {
    where.productCategoryId = selectedCategory;
  } else if (parentCategory) {
    // include listings in the parent category OR any of its subcategories
    const childIds = Array.isArray(parentCategory.subcategories) ? parentCategory.subcategories.map((s: any) => s.id) : [];
    const candidateCategoryIds = [parentCategory.id, ...childIds];
    where.productCategoryId = { in: candidateCategoryIds };
  }
  

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

        <div className="flex justify-between items-end my-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Popular near you</h2>
            <p className="text-gray-500 mt-1">Highest rated services based on user reviews</p>
          </div>
          <a href="#" className="text-violet-600 font-semibold text-sm flex items-center gap-1 hover:underline">
            View all on map <ArrowUpRightIcon className='w-4 h-4' />
          </a>
        </div>
        
        {/* Grid */}
        <div className="mt-8">
          <CarGrid cars={cars} />
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2 mt-10">
          <a
            href={`/${slug}/automarket?page=${pageNum - 1}&search=${encodeURIComponent(search)}&category=${selectedCategory}&sort=${sort}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}`}
            className={`px-3 py-1 border rounded ${pageNum <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Previous
          </a>

          {Array.from({ length: totalPages }, (_, i) => (
            <a
              key={i}
              href={`/${slug}/automarket?page=${i + 1}&search=${encodeURIComponent(search)}&category=${selectedCategory}&sort=${sort}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}`}
              className={`px-3 py-1 border rounded ${i + 1 === pageNum ? 'bg-gray-200' : ''}`}
            >
              {i + 1}
            </a>
          ))}

          <a
            href={`/${slug}/automarket?page=${pageNum + 1}&search=${encodeURIComponent(search)}&category=${selectedCategory}&sort=${sort}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}`}
            className={`px-3 py-1 border rounded ${pageNum >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Next
          </a>
        </div>

        {/* Promotional Section */}
        <div className="mt-20 bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div className="p-10 flex-1 flex flex-col justify-center">
             <div className="inline-block px-3 py-1 rounded-md bg-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wide w-fit mb-4">
               For Business Owners
             </div>
             <h3 className="text-3xl font-bold mb-4 text-gray-900">List your business on UrbanClap</h3>
             <p className="text-gray-600 mb-8 text-lg">
               Reach thousands of local customers, manage bookings effortlessly, and grow your brand with our premium tools.
             </p>
             <div className="flex gap-4">
               <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition-colors">
                 Get Started
               </button>
               <button className="px-6 py-3 rounded-xl font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                 Learn More
               </button>
             </div>
          </div>
          <div className="flex-1 bg-gray-100 relative min-h-[300px]">
             <img 
               src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop" 
               alt="Business Owner"
               className="absolute inset-0 w-full h-full object-cover"
             />
          </div>
        </div>
      </main>

      <NewsletterSection />
    </div>
  );
}
