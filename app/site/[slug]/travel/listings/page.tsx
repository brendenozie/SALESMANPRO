// app/[slug]/products/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb';
import Section from '@/components/site/Section/Section';
import ProductGrid from '@/components/site/productGrid/ProductGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import ProductFilters from './ProductFilters';

type Category = { id: string; name: string; icon?: string | null; slug?: string };
type Product = {
  id: string;
  name: string;
  price: number;
  images: string[]; // preserve original images array to keep ProductCard working
  slug?: string | null;
  finalPrice?: number | null;
  sellingPrice?: number | null;
  productCategoryId?: string | null;
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
  if (search) where.title = { contains: search, mode: 'insensitive' };
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

  // Map to the shape the client ProductCard expects while preserving raw arrays
  const products: Product[] = listings.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.finalPrice ?? (p.sellingPrice ?? 0),
    finalPrice: p.finalPrice ?? null,
    sellingPrice: p.sellingPrice ?? null,
    images: Array.isArray(p.images) ? p.images.map((i: any) => i?.url || i) : [],
    slug: p.slug ?? '',
    productCategoryId: p.productCategoryId ?? null,
  }));

  const cats: Category[] = categories.map((c: any) => ({
    id: c.id,
    name: c.name,
    icon: c.icon ?? null,
    slug: c.slug ?? c.id,
  }));

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Section title="Products">
          {/* Client-side filter bar (Airbnb style) */}
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

          {/* Grid */}
          <ProductGrid products={products} />

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2 mt-8">
            <a
              href={`/${slug}/products?page=${pageNum - 1}&search=${encodeURIComponent(search || '')}&category=${categoryId || ''}&sort=${sortOption}`}
              className={`px-3 py-1 border rounded ${pageNum <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Previous
            </a>
            {Array.from({ length: totalPages }, (_, i) => (
              <a
                key={i}
                href={`/${slug}/products?page=${i + 1}&search=${encodeURIComponent(search || '')}&category=${categoryId || ''}&sort=${sortOption}`}
                className={`px-3 py-1 border rounded ${i + 1 === pageNum ? 'bg-gray-200' : ''}`}
              >
                {i + 1}
              </a>
            ))}
            <a
              href={`/${slug}/products?page=${pageNum + 1}&search=${encodeURIComponent(search || '')}&category=${categoryId || ''}&sort=${sortOption}`}
              className={`px-3 py-1 border rounded ${pageNum >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Next
            </a>
          </div>
        </Section>
      </div>

      <NewsletterSection />
    </div>
  );
}
