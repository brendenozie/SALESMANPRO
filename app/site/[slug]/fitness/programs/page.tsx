import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb';
import Link from 'next/link';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import ProductGrid from '@/components/site/fitnessProgramGrid/ProductGrid';

type Category = { id: string; name: string };

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function ProductListPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page, search, category, sort } = await searchParams;
  
  const pageSize = 12;
  const pageNum = parseInt(page || '1', 10);
  const categoryId = category || undefined;
  const sortOption = sort || 'newest';

  // Fetch the company and dynamic config options natively
  const baseCompany = await prisma.company.findUnique({ where: { slug } });
  if (!baseCompany) notFound();

  // Handle dynamic conditional system queries
  const where: any = { 
    companyId: baseCompany.id,
    status: 'ACTIVE'
  };
  
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }
  if (categoryId) {
    where.productCategoryId = categoryId;
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'priceAsc') orderBy = { finalPrice: 'asc' };
  if (sort === 'priceDesc') orderBy = { finalPrice: 'desc' };

  const [listings, totalCount, categories] = await Promise.all([
    prisma.marketplaceListings.findMany({
      where,
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      orderBy,
    }),
    prisma.marketplaceListings.count({ where }),
    prisma.productCategory.findMany({ 
      where:{
        StoreCategory: {
          some: {
            companyId: baseCompany.id,
          }
        }
      },
      orderBy: { name: 'asc' } }),
  ]);

  // Clean data hydration safely for the Client UI Cards
  const products = listings.map((p: any) => ({
    ...p,
    id: p.id,
    name: p.name,
    finalPrice: p.finalPrice ?? p.sellingPrice ?? 0,
    currency: baseCompany.currency || 'KES',
    images: Array.isArray(p.images) && p.images.length > 0 
      ? p.images 
      : [{ url: 'https://dozi4r4ug9739.cloudfront.net/images/1779884960821-pexels-ketut-subiyanto-4720807.jpg' }],
  }));

  const cats: Category[] = categories.map(c => ({ id: c.id, name: c.name }));
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20">
        
        {/* Editorial Heading Section */}
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase sm:text-5xl">
            Available Sessions & Classes
          </h1>
          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">
            Book certified custom training blocks, premium wellness programs, and single athletic group slots.
          </p>
        </div>

        {/* Filter Toolbar System */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
          <form method="get" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <input
                name="search"
                defaultValue={search || ''}
                placeholder="Search sessions..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-sm border-0 focus:ring-2 focus:ring-indigo-600 rounded-xl px-4 py-3"
              />
            </div>
            <div>
              <select
                name="category"
                defaultValue={categoryId || ''}
                className="w-full bg-slate-50 dark:bg-slate-800 text-sm border-0 focus:ring-2 focus:ring-indigo-600 rounded-xl px-4 py-3"
              >
                <option value="">All Categories</option>
                {cats.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                name="sort"
                defaultValue={sortOption}
                className="w-full bg-slate-50 dark:bg-slate-800 text-sm border-0 focus:ring-2 focus:ring-indigo-600 rounded-xl px-4 py-3"
              >
                <option value="newest">Newest Sessions</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
            <div>
              <button 
                type="submit" 
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm transition-all hover:bg-slate-800"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Program Cards Display Grid */}
        <ProductGrid products={products} slug={slug} />

        {/* Dynamic Contextual Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12 border-t border-slate-200 dark:border-slate-800 pt-6">
            <Link
              href={`/fitness/programs?page=${pageNum - 1}&search=${search || ''}&category=${categoryId || ''}&sort=${sortOption}`}
              className={`px-4 py-2 border dark:border-slate-800 text-sm font-medium rounded-xl transition-all ${pageNum <= 1 ? 'opacity-40 pointer-events-none' : 'hover:bg-white dark:hover:bg-slate-900'}`}
            >
              Previous
            </Link>
            {Array.from({ length: totalPages }, (_, i) => (
              <Link
                key={i}
                href={`/fitness/programs?page=${i + 1}&search=${search || ''}&category=${categoryId || ''}&sort=${sortOption}`}
                className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${i + 1 === pageNum ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900'}`}
              >
                {i + 1}
              </Link>
            ))}
            <Link
              href={`/fitness/programs?page=${pageNum + 1}&search=${search || ''}&category=${categoryId || ''}&sort=${sortOption}`}
              className={`px-4 py-2 border dark:border-slate-800 text-sm font-medium rounded-xl transition-all ${pageNum >= totalPages ? 'opacity-40 pointer-events-none' : 'hover:bg-white dark:hover:bg-slate-900'}`}
            >
              Next
            </Link>
          </div>
        )}
      </div>
      <NewsletterSection />
    </div>
  );
}