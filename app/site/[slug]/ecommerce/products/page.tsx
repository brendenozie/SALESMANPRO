// app/[slug]/products/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb';
import Link from 'next/link';
import Section from '@/components/site/Section/Section';
import ProductGrid from '@/components/site/productGrid/ProductGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';

type Category = { id: string; name: string };

interface PageProps {
  params: { slug: string };
  searchParams: {
    page?: string;
    search?: string;
    category?: string;
    sort?: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function ProductListPage({ params, searchParams }: PageProps) {
  const { slug } = params;
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 12;
  const search = searchParams.search || '';
  const categoryId = searchParams.category || null;
  const sort = searchParams.sort || 'newest';

  // Ensure store exists
  const baseCompany = await prisma.company.findUnique({ where: { slug } });
  if (!baseCompany) notFound();

  // Build filters
  const where: any = { companyId: baseCompany.id };
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (categoryId) where.productCategoryId = categoryId;

  // Determine sort order
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'priceAsc') orderBy = { finalPrice: 'asc' };
  if (sort === 'priceDesc') orderBy = { finalPrice: 'desc' };
  if (sort === 'rating') orderBy = { rating: 'desc' };

  // Fetch data while omitting problematic field
  const [listings, totalCount, categories] = await Promise.all([
    prisma.marketplaceListings.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
      select: {
        id: true,
        name: true,
        finalPrice: true,
        sellingPrice: true,
        images: true,
        // bedrooms intentionally omitted to avoid type mismatch
      },
    }),
    prisma.marketplaceListings.count({ where }),
    prisma.productCategory.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const cats: Category[] = categories.map(c => ({ id: c.id, name: c.name }));
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="max-w-7xl mx-auto py-8">
        <Section title="Products">
          <form method="get" className="flex flex-col lg:flex-row items-center justify-between mb-6 space-y-4 lg:space-y-0">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search products..."
              className="border rounded-full px-4 py-2 w-full lg:w-1/3"
            />
            <select
              name="category"
              defaultValue={categoryId || ''}
              className="border rounded px-4 py-2 w-full lg:w-1/4"
            >
              <option value="">All Categories</option>
              {cats.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={sort}
              className="border rounded px-4 py-2 w-full lg:w-1/4"
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Apply</button>
          </form>

          <ProductGrid products={listings} />

          <div className="flex justify-center items-center space-x-2 mt-8">
            <Link
              href={`/${slug}/products?page=${page - 1}&search=${search}&category=${categoryId || ''}&sort=${sort}`}
              className={`px-3 py-1 border rounded ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
            >Previous</Link>
            {Array.from({ length: totalPages }, (_, i) => (
              <Link
                key={i}
                href={`/${slug}/products?page=${i + 1}&search=${search}&category=${categoryId || ''}&sort=${sort}`}
                className={`px-3 py-1 border rounded ${i + 1 === page ? 'bg-gray-200' : ''}`}
              >{i + 1}</Link>
            ))}
            <Link
              href={`/${slug}/products?page=${page + 1}&search=${search}&category=${categoryId || ''}&sort=${sort}`}
              className={`px-3 py-1 border rounded ${page >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
            >Next</Link>
          </div>
        </Section>
      </div>
      <NewsletterSection />
    </div>
  );
}
