import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb';
import ProductGrid from './ProductGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import ProductFilters from './ProductFilters';
import Image from 'next/image';


type Category = { id: string; name: string; icon?: string | null; slug?: string };
type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug?: string | null;
  finalPrice?: number | null;
  sellingPrice?: number | null;
  productCategoryId?: string | null;
  rating?: number;
  locationName?: string; // Assuming you might have this, otherwise optional
};

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    sort?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductListPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page, search, category, sort } = await searchParams;

  const pageSize = 12;
  const pageNum = parseInt(page || '1', 10);
  const categoryId = category || undefined;
  const sortOption = sort || 'newest';

  // Ensure store exists
  const baseCompany = await prisma.company.findUnique({ where: { slug } });
  if (!baseCompany) notFound();

  // Build filters
  const where: any = { companyId: baseCompany.id };
  if (search) where.name = { contains: search, mode: 'insensitive' }; // Changed title to name based on schema
  if (categoryId) where.productCategoryId = categoryId;

  // Determine sort order
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'priceAsc') orderBy = { finalPrice: 'asc' };
  if (sort === 'priceDesc') orderBy = { finalPrice: 'desc' };
  if (sort === 'rating') orderBy = { rating: 'desc' };

  // Fetch data
  const [listings, totalCount, categories] = await Promise.all([
    prisma.marketplaceListings.findMany({
      where,
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      orderBy,
    }),
    prisma.marketplaceListings.count({ where }),
    prisma.productCategory.findMany({ orderBy: { name: 'asc' } }),
  ]);

  // Map Data
  const products: Product[] = listings.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.finalPrice ?? (p.sellingPrice ?? 0),
    finalPrice: p.finalPrice ?? null,
    sellingPrice: p.sellingPrice ?? null,
    images: Array.isArray(p.images) ? p.images.map((i: any) => i?.url || i) : [],
    slug: p.slug ?? '',
    productCategoryId: p.productCategoryId ?? null,
    rating: p.rating ?? 4.8, // Mock rating if null for visual consistency
  }));

  const cats: Category[] = categories.map((c: any) => ({
    id: c.id,
    name: c.name,
    icon: c.icon ?? null,
    slug: c.slug ?? c.id,
  }));

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop" alt="Hero Background" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-6xl drop-shadow-lg">
            Explore <span className="text-teal-400">{baseCompany.name}</span>
          </h1>
          <p className="max-w-xl text-lg text-gray-100 md:text-xl drop-shadow-md">
            Find the best products curated just for you.
          </p>
        </div>
      </div>

      {/* --- FILTERS (Floating overlap) --- */}
      <div className="relative z-20 -mt-10 px-4">
        <ProductFilters
          categories={cats}
          current={{
            page: pageNum,
            search: search || '',
            category: categoryId || '',
            sort: sortOption,
            slug,
          }}
          totalCount={totalCount}
        />
      </div>

      {/* --- PRODUCT GRID --- */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">

         <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Popular Destinations</h2>
            <p className="mt-1 text-gray-500">Hand-picked selections just for you</p>
          </div>
          
        </div>
        
        <ProductGrid products={products} />

        {/* --- PAGINATION --- */}
        <div className="flex justify-center items-center space-x-2 mt-16 mb-12">
            <a
              href={`/${slug}/products?page=${pageNum - 1}&search=${encodeURIComponent(search || '')}&category=${categoryId || ''}&sort=${sortOption}`}
              className={`px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-semibold shadow-sm transition-all hover:bg-gray-50 ${pageNum <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Previous
            </a>
            <div className="hidden sm:flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <a
                key={i}
                href={`/${slug}/products?page=${i + 1}&search=${encodeURIComponent(search || '')}&category=${categoryId || ''}&sort=${sortOption}`}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    i + 1 === pageNum 
                    ? 'bg-slate-900 text-white shadow-md scale-110' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </a>
            ))}
            </div>
            <a
              href={`/${slug}/products?page=${pageNum + 1}&search=${encodeURIComponent(search || '')}&category=${categoryId || ''}&sort=${sortOption}`}
              className={`px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-semibold shadow-sm transition-all hover:bg-gray-50 ${pageNum >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Next
            </a>
        </div>
      </main>

      <NewsletterSection />
    </div>
  );
}