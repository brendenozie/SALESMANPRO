import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb';
import Link from 'next/link';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import { findCompanyCached } from '@/lib/company-fetcher';
import GreyServicesSection from '@/components/site/layouts/CompanyPortfolioLayout/body/components/ServicesSection';

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

  // 1. Validate Store / Company Existence
  const baseCompany = await findCompanyCached(slug, "lean");
  if (!baseCompany) notFound();

  // 2. Build Prisma Filters
  const where: any = { companyId: baseCompany.id };
  
  if (search) {
    // Broadened search to check both name and description if applicable
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      // Uncomment if your schema has a description field:
      // { description: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (categoryId) where.productCategoryId = categoryId;

  // 3. Determine Sort Order
  let orderBy: any = { createdAt: 'desc' };
  if (sortOption === 'priceAsc') orderBy = { finalPrice: 'asc' };
  if (sortOption === 'priceDesc') orderBy = { finalPrice: 'desc' };
  if (sortOption === 'rating') orderBy = { rating: 'desc' };

  // 4. Fetch Data Concurrently
  const [listings, totalCount, categories] = await Promise.all([
    prisma.marketplaceListings.findMany({
      where,
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      orderBy,
      // Ensure you include images/tags if your schema uses relations
      // include: { images: true, tags: true } 
    }),
    prisma.marketplaceListings.count({ where }),
    prisma.storeCategory.findMany({ where: { companyId: baseCompany.id }, include: {  category: true } }),
  ]);

  // 5. Map Database Output to the specific `ServiceItem` Interface
  const formattedServices = listings.map((p, index) => {
    // Safely extract the image, fallback to a premium default if missing
    // Adjust `p.images` logic depending on how Prisma stores your images (relation vs JSON)
    // const firstImage = Array.isArray(p.images) && p.images.length > 0 
    //   ? (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any)?.url)
    //   : 'https://images.unsplash.com/photo-1610375228911-c4ab455981ca?q=80&w=2070&auto=format&fit=crop';

    return {
      id: p.id,
      name: p.name || 'Premium Commodity Allocation',
      // Provide a fallback description if your DB doesn't have one
      description: (p as any).description || 'Verified pipeline execution backed by audited compliance chains and locked fulfillment tracks.',
      // imageUrl: firstImage,
      images:p.images || [],
      slug: p.slug || p.id,
      // Map tags/features if they exist, otherwise provide default cinematic specs
      specs: (p as any).tags || ['Verified Origin', 'Secure Transit', 'AML Cleared'],
      metric: p.finalPrice ? `$${Number(p.finalPrice).toLocaleString()}` : 'A-Grade',
      metricLabel: p.finalPrice ? 'Valuation' : 'Quality Class'
    };
  });

  const cats = categories.map(c => ({ id: c.id, displayName: c.displayName, categoryId: c.categoryId, category: c.category }));
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200 font-sans">
      
      {/* --- Premium Filter Dashboard --- */}
      <div className="max-w-7xl mx-auto px-4 pt-12 sm:px-6 lg:px-8 relative z-20">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-2xl">
          <form method="get" className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search */}
            <div className="md:col-span-4">
              <input
                name="search"
                defaultValue={search || ''}
                placeholder="Search allocations & channels..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-3">
              <select
                name="category"
                defaultValue={categoryId || ''}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-zinc-300 outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="">All Commodity Tracks</option>
                {cats.map(c => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-3">
              <select
                name="sort"
                defaultValue={sortOption}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-zinc-300 outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="newest">Sort: Newest Pipeline</option>
                <option value="priceAsc">Valuation: Low to High</option>
                <option value="priceDesc">Valuation: High to Low</option>
                <option value="rating">Top Rated Metrics</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button 
                type="submit" 
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold tracking-wide text-sm px-4 py-3 rounded-xl transition-colors duration-200 shadow-lg shadow-amber-500/20"
              >
                Filter
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* --- Main Cinematic Component --- */}
      {formattedServices.length > 0 ? (
        <div className="-mt-12 lg:-mt-20">
          <GreyServicesSection services={formattedServices} storeSlug={slug} />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-40 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
            {/* Simple icon placeholder */}
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-zinc-200 mb-2">No active channels found</h3>
          <p className="text-zinc-500 font-light text-sm max-w-md">Try adjusting your filters or search terms to uncover available asset pipelines.</p>
        </div>
      )}

      {/* --- Premium Pagination Module --- */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-4 pb-20 flex justify-center items-center gap-2 relative z-20">
          <Link
            href={`/${slug}/products?page=${pageNum - 1}&search=${search || ''}&category=${categoryId || ''}&sort=${sortOption}`}
            className={`px-4 py-2 text-xs font-mono tracking-widest uppercase border rounded-xl transition-all ${
              pageNum <= 1 
                ? 'opacity-30 pointer-events-none border-zinc-800 text-zinc-600' 
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-amber-400 bg-zinc-900/50'
            }`}
          >
            Prev
          </Link>
          
          <div className="flex gap-1.5 mx-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <Link
                key={i}
                href={`/${slug}/products?page=${i + 1}&search=${search || ''}&category=${categoryId || ''}&sort=${sortOption}`}
                className={`w-8 h-8 flex items-center justify-center text-xs font-mono rounded-lg border transition-all ${
                  i + 1 === pageNum 
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 font-bold' 
                    : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
                }`}
              >
                {i + 1}
              </Link>
            ))}
          </div>

          <Link
            href={`/${slug}/products?page=${pageNum + 1}&search=${search || ''}&category=${categoryId || ''}&sort=${sortOption}`}
            className={`px-4 py-2 text-xs font-mono tracking-widest uppercase border rounded-xl transition-all ${
              pageNum >= totalPages 
                ? 'opacity-30 pointer-events-none border-zinc-800 text-zinc-600' 
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-amber-400 bg-zinc-900/50'
            }`}
          >
            Next
          </Link>
        </div>
      )}

      {/* <NewsletterSection className="bg-zinc-900 text-zinc-400 border-zinc-800" /> */}
    </div>
  );
}