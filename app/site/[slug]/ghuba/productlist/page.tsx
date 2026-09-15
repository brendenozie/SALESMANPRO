'use client';

import { useState, useMemo, useTransition, useDeferredValue, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import { MagnifyingGlassIcon, ExclamationCircleIcon, XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";

import Filters from "@/components/Filters";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { SkeletonGrid } from "@/components/site/layouts/GhubaLayout/body/components/SkeletonGrid/SkeletonGrid";
import VirtualizedGrid from "./VirtualizedGrid";

function ProductListContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    brand: searchParams.getAll('brand'),
    category: searchParams.getAll('category'),
    subCategory: searchParams.getAll('subCategory'),
    priceRange: [
      Number(searchParams.get('minPrice')) || 0, 
      Number(searchParams.get('maxPrice')) || 1e7
    ],
    sort: searchParams.get('sort') || 'finalPrice',
  });

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams();
    if (deferredSearchTerm) params.set('search', deferredSearchTerm);
    filters.brand.forEach(b => params.append('brand', b));
    filters.category.forEach(c => params.append('category', c));
    if (filters.priceRange[0] > 0) params.set('minPrice', filters.priceRange[0].toString());
    if (filters.priceRange[1] < 1e7) params.set('maxPrice', filters.priceRange[1].toString());
    if (filters.sort) params.set('sort', filters.sort);
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [filters, deferredSearchTerm, pathname, router]);

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useInfiniteProducts({ 
    searchTerm: deferredSearchTerm, 
    filters 
  });

  const handleFilterUpdate = useCallback((newFilters: any) => {
    startTransition(() => {
      setFilters(newFilters);
    });
  }, []);

  const flatProducts = useMemo(() => 
    data?.pages.flatMap(page => page.data || []) || [], 
  [data]);

  const totalProducts = data?.pages?.[0]?.meta?.total ?? flatProducts.length;

  const removeFilterItem = (type: 'brand' | 'category' | 'subCategory', value: string) => {
    handleFilterUpdate({
      ...filters,
      [type]: filters[type].filter((item: string) => item !== value),
    });
  };

  const clearAllFilters = () => {
    handleFilterUpdate({
      ...filters,
      brand: [],
      category: [],
      subCategory: [],
      priceRange: [0, 1e7],
    });
    setSearchTerm('');
  };

  const hasActiveFilters = 
    filters.brand.length > 0 || 
    filters.category.length > 0 || 
    filters.subCategory.length > 0 || 
    Boolean(searchTerm) ||
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 1e7;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start">
      <aside className="md:sticky md:top-24 z-10 self-start">
        <Filters 
          filters={filters} 
          setFilters={handleFilterUpdate} 
          searchTerm={searchTerm}
          onSearch={setSearchTerm} 
        />
      </aside>

      <main className="md:col-span-3 min-h-[50vh] flex flex-col gap-4">
        {/* Top Control & Active Filters Bar */}
        <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                {isLoading ? "Searching..." : `${totalProducts.toLocaleString()} Products`}
              </span>
              {isPending && (
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Sort:
              </label>
              <select
                id="sort-select"
                value={filters.sort}
                onChange={(e) => handleFilterUpdate({ ...filters, sort: e.target.value })}
                className="text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="finalPrice">Price: Low to High</option>
                <option value="-finalPrice">Price: High to Low</option>
                <option value="-createdAt">Newest Arrivals</option>
                <option value="discount">Biggest Discounts</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 mr-1">
                Active:
              </span>

              {searchTerm && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg">
                  "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="hover:text-red-500">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.category.map((cat) => (
                <span key={cat} className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 rounded-lg">
                  {cat}
                  <button onClick={() => removeFilterItem('category', cat)} className="hover:text-red-500">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.subCategory.map((sub) => (
                <span key={sub} className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-300 rounded-lg">
                  {sub}
                  <button onClick={() => removeFilterItem('subCategory', sub)} className="hover:text-red-500">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.brand.map((b) => (
                <span key={b} className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 rounded-lg">
                  {b}
                  <button onClick={() => removeFilterItem('brand', b)} className="hover:text-red-500">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <button
                onClick={clearAllFilters}
                className="text-[11px] font-bold text-red-500 hover:underline ml-auto pl-2"
              >
                Reset All
              </button>
            </div>
          )}
        </div>

        {(isLoading || isPending) && flatProducts.length === 0 ? (
          <SkeletonGrid count={8} />
        ) : flatProducts.length > 0 ? (
          <VirtualizedGrid 
            products={flatProducts} 
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 px-4 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="bg-amber-100 dark:bg-amber-500/10 p-5 rounded-full mb-4 text-amber-600 dark:text-amber-400">
              <MagnifyingGlassIcon className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">No products found</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
              We couldn't find any items matching your selected criteria. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProductList() {
  return (
    <div className="mx-auto px-2.5 sm:px-4 lg:px-8 py-4 sm:py-8 bg-white dark:bg-gray-950 min-h-screen">
      <div className="mb-6 sm:mb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">
          <SparklesIcon className="w-3.5 h-3.5" /> Curated Marketplace
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Explore Our Collection
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Discover vetted vehicles, electronics, lifestyle goods, and prime listings tailored for you.
        </p>
      </div>

      <ErrorBoundary fallback={
        <div className="flex items-center justify-center p-4 text-red-800 bg-red-50 dark:bg-red-500/10 rounded-xl">
          <ExclamationCircleIcon className="w-5 h-5 mr-2" />
          <p>Failed to load products. Please refresh.</p>
        </div>
      }>
        <Suspense fallback={<div className="mt-8"><SkeletonGrid count={8} /></div>}>
          <ProductListContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}