'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MarketListingForm } from '@/types/typings';
import FilterSidebar from '../FilterSidebar/FilterSidebar';
import ProductCard from '../ProductCard/ProductCard';

export interface FilterState {
  search: string;
  category: string | null;
  sort: string;
  minPrice: number;
  maxPrice: number;
  colors: string[];
}

interface ProductListWrapperProps {
  products: MarketListingForm[];
  categories: { id: string, displayName: string }[];
}



export default function ProductListWrapper({ products, categories }: ProductListWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filter state from URL search parameters
  const getInitialFilters = (): FilterState => {
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000');
    return {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || null,
      sort: searchParams.get('sort') || 'newest',
      minPrice: isNaN(minPrice) ? 0 : minPrice,
      maxPrice: isNaN(maxPrice) ? 1000 : maxPrice,
      colors: searchParams.get('colors')?.split(',') || [],
    };
  };

  const [filters, setFilters] = useState<FilterState>(getInitialFilters);

  // Update URL whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.sort !== 'newest') params.set('sort', filters.sort);
    if (filters.minPrice !== 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== 1000) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.colors.length > 0) params.set('colors', filters.colors.join(','));

    // Update the URL without a full page reload
    router.push(`?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  return (
    <>
      <aside className="w-1/4 pr-8 sticky top-24 self-start">
        <FilterSidebar filters={filters} setFilters={setFilters} categories={categories} />
      </aside>

      <main className="flex-1">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">All Products</h1>
          <div className="text-xl text-gray-600 dark:text-gray-400 font-medium">
            {products.length === 0 ? 'No results found' : `Showing ${products.length} Products`}
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.length === 0 ? (
            <div className="col-span-full text-center text-xl text-gray-500 py-12">
              <p>No products match your filters. 😥</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </section>
      </main>
    </>
  );
}
