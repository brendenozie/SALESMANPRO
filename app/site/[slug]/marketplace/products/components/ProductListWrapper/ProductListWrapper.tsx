'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterSidebar from '../FilterSidebar/FilterSidebar';
import { AdjustmentsHorizontalIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/site/layouts/EcommerceAgrovetLayout/body/components/ProductCard';

export interface FilterState {
  search: string;
  category: string | null;
  sort: string;
  minPrice: number;
  maxPrice: number;
  colors: string[];
}

export default function ProductListWrapper({ products, categories }: any) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

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
    <div className="max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Desktop Sidebar: Floating Glass Card */}
        <aside className="hidden lg:block w-[300px] sticky top-28 h-fit">
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <FilterSidebar  filters={filters} setFilters={setFilters}  categories={categories} />
          </div>
        </aside>

        <main className="flex-1 space-y-8">
          {/* Action Bar */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">
                The Collection
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2">
                Curated for the modern explorer. {products.length} found.
              </p>
            </div>

            {/* Mobile Filter Trigger */}
            <div className="flex items-center gap-3 lg:hidden">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 px-6 rounded-2xl font-bold text-sm uppercase tracking-widest"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Filters
              </button>
            </div>
          </header>

          {/* Product Grid */}
          {/* Product Grid - Optimized for Mobile Breathing Room */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-4 px-4 sm:px-0">
            <AnimatePresence mode='popLayout'>
              {products.map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  layout // Smoothly animate grid position changes
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        </main>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white dark:bg-zinc-950 z-[110] rounded-t-[32px] p-8 max-h-[90vh] overflow-y-auto lg:hidden"
            >
              <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8" />
              <FilterSidebar filters={filters} setFilters={setFilters} categories={categories} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}