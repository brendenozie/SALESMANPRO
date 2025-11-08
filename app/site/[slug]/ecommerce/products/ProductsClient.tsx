'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import Section from '@/components/site/Section/Section';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import { SkeletonGrid } from '@/components/site/SkeletonGrid/SkeletonGrid';
import ProductCard from '@/components/site/layouts/EcommerceLayout/body/components/ProductCard';

// if (categoryId) whereFilter.product = { productCategoryId: categoryId };
interface ProductsClientProps {
  companyId: string;
  slug: string;
  initialData: {
    listings: any[];
    pagination: { totalCount: number; totalPages: number; page: number };
    categories: { id: string; displayName: string | null; categoryId: string | null }[];
  };
  initialFilters: { search?: string; category?: string; sort?: string; page?: number };
}

export default function ProductsClient({
  companyId,
  slug,
  initialData,
  initialFilters,
}: ProductsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialFilters.search || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  const [sort, setSort] = useState(initialFilters.sort || 'newest');
  const pageSize = 12;

  // SWR fetchers
  const fetcher = createCachedFetcher(`products-${companyId}`);
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && previousPageData.data.length === 0) return null; // reached end
    return `${apiBaserUrl}/site/productsByFlag?id=${companyId}&flag=all&limit=${pageSize}&page=${pageIndex + 1}&search=${search}&category=${category}&sort=${sort}`;
  };

  const {
    data,
    error,
    isLoading,
    size,
    setSize,
    mutate,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
    persistSize: true,
    revalidateOnFocus: false,
    fallbackData: [{ data: initialData.listings, pagination: initialData.pagination }],
  });

  const {
    data: categoryData,
    isLoading: isCategoriesLoading,
  } = useSWR(`${apiBaserUrl}/site/categories?companyId=${companyId}`, fetcher, {
    fallbackData: initialData.categories,
    dedupingInterval: 60000,
  });

  console.log('ProductsClient categoryData:', categoryData);  
  const allProducts = data ? data.flatMap((page) => page.data) : [];
  const totalPages = data?.[0]?.pagination?.totalPages || 1;

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    router.replace(`/site/${slug}/ecommerce/products?${params.toString()}`, { scroll: false });
  }, [search, category, sort]);

  // Observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSize((s) => s + 1);
        }
      },
      { rootMargin: '200px' } // preload before reaching bottom
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [setSize]);

  // Submit filters (reset data)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate([], false); // clear cache
    setSize(1); // reset pagination
  };

  if (isLoading && size === 1) return <SkeletonGrid count={pageSize} />;
  if (error) return <div className="text-center text-gray-500">Failed to load products.</div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="max-w-7xl mx-auto py-8">
        <Section title="Products">
          {/* Filters */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col lg:flex-row items-center justify-between mb-6 space-y-4 lg:space-y-0"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="border rounded-full px-4 py-2 w-full lg:w-1/3"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded px-4 py-2 w-full lg:w-1/4"
            >
              <option value="">All Categories</option>
              {isCategoriesLoading ? (
                <option disabled>Loading...</option>
              ) : (
                categoryData?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border rounded px-4 py-2 w-full lg:w-1/4"
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Apply
            </button>
          </form>

          {/* Product Grid */}
          <div className="max-w-7xl py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {allProducts && allProducts.map((product: any, idx: number) => {
              return <ProductCard key={product.id} product={product} />
            })}
          </div>

          {/* Infinite Scroll Loader */}
          {size < totalPages ? (
            <div ref={loadMoreRef} className="flex justify-center py-6">
              <span className="text-gray-500 animate-pulse">Loading more...</span>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-6">You've reached the end.</div>
          )}
        </Section>
      </div>
      <NewsletterSection />
    </div>
  );
}
