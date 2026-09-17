'use client';

import { useState, useMemo, useTransition, useDeferredValue, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import {
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

import CategoryAwareFilterDrawer from "@/components/search/CategoryAwareFilterDrawer";
import NoResultsFallback from "@/components/search/NoResultsFallback";
import UniversalSearchBar from "@/components/search/UniversalSearchBar";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { SkeletonGrid } from "@/components/site/layouts/GhubaLayout/body/components/SkeletonGrid/SkeletonGrid";
import VirtualizedGrid from "./VirtualizedGrid";

function ProductListContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('q') || searchParams.get('search') || ''
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<any>({
    brand: searchParams.getAll('brand'),
    category: searchParams.getAll('category'),
    subCategory: searchParams.getAll('subCategory'),
    condition: searchParams.getAll('condition'),
    make: searchParams.getAll('make'),
    transmission: searchParams.getAll('transmission'),
    fuelType: searchParams.getAll('fuelType'),
    bodyType: searchParams.getAll('bodyType'),
    propertyType: searchParams.getAll('propertyType'),
    bedrooms: searchParams.getAll('bedrooms'),
    bathrooms: searchParams.getAll('bathrooms'),
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sort: searchParams.get('sort') || 'newest',
  });

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [isPending, startTransition] = useTransition();

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (deferredSearchTerm) params.set('search', deferredSearchTerm);

    (filters.brand || []).forEach((b: string) => params.append('brand', b));
    (filters.category || []).forEach((c: string) => params.append('category', c));
    (filters.subCategory || []).forEach((s: string) => params.append('subCategory', s));
    (filters.condition || []).forEach((c: string) => params.append('condition', c));
    (filters.make || []).forEach((m: string) => params.append('make', m));
    (filters.transmission || []).forEach((t: string) => params.append('transmission', t));
    (filters.fuelType || []).forEach((f: string) => params.append('fuelType', f));
    (filters.bodyType || []).forEach((b: string) => params.append('bodyType', b));
    (filters.propertyType || []).forEach((p: string) => params.append('propertyType', p));
    (filters.bedrooms || []).forEach((b: string) => params.append('bedrooms', b));
    (filters.bathrooms || []).forEach((b: string) => params.append('bathrooms', b));

    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      params.set('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice !== undefined && filters.maxPrice < 1e7) {
      params.set('maxPrice', filters.maxPrice.toString());
    }
    if (filters.sort) params.set('sort', filters.sort);

    startTransition(() => {
      const paramsString = params.toString();
      const newUrl = paramsString ? `${pathname}?${paramsString}` : pathname;
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", newUrl);
      }
    });
  }, [filters, deferredSearchTerm, pathname]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteProducts({
    searchTerm: deferredSearchTerm,
    filters,
    scope: "GHUBA",
  });

  const handleFilterUpdate = useCallback((newFilters: any) => {
    startTransition(() => {
      setFilters(newFilters);
    });
  }, []);

  const flatProducts = useMemo(
    () => data?.pages.flatMap((page) => page.data || []) || [],
    [data]
  );

  const totalProducts = data?.pages?.[0]?.meta?.total ?? flatProducts.length;
  const suggestions = data?.pages?.[0]?.suggestions;

  const removeFilterItem = (type: string, value: string) => {
    const current = (filters[type] || []) as string[];
    handleFilterUpdate({
      ...filters,
      [type]: current.filter((item: string) => item !== value),
    });
  };

  const clearAllFilters = () => {
    handleFilterUpdate({
      brand: [],
      category: [],
      subCategory: [],
      condition: [],
      make: [],
      transmission: [],
      fuelType: [],
      bodyType: [],
      propertyType: [],
      bedrooms: [],
      bathrooms: [],
      minPrice: undefined,
      maxPrice: undefined,
      sort: filters.sort,
    });
    setSearchTerm('');
  };

  const hasActiveFilters =
    (filters.brand?.length || 0) > 0 ||
    (filters.category?.length || 0) > 0 ||
    (filters.subCategory?.length || 0) > 0 ||
    (filters.condition?.length || 0) > 0 ||
    (filters.make?.length || 0) > 0 ||
    (filters.propertyType?.length || 0) > 0 ||
    Boolean(searchTerm) ||
    (filters.minPrice !== undefined && filters.minPrice > 0) ||
    (filters.maxPrice !== undefined && filters.maxPrice < 1e7);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start">
      {/* Filter Sidebar: Desktop Sticky Sidebar & Mobile Bottom Sheet Drawer */}
      <div className="md:sticky md:top-24 z-10 self-start">
        <CategoryAwareFilterDrawer
          filters={filters}
          onFilterChange={handleFilterUpdate}
          category={filters.category?.[0]}
          scope="GHUBA"
          isMobileDrawerOpen={isMobileFilterOpen}
          onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
        />
      </div>

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

            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs font-bold transition-colors"
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-amber-500" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-select"
                  className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider"
                >
                  Sort:
                </label>
                <select
                  id="sort-select"
                  value={filters.sort}
                  onChange={(e) => handleFilterUpdate({ ...filters, sort: e.target.value })}
                  className="text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="discount">Biggest Discounts</option>
                </select>
              </div>
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

              {filters.category?.map((cat: string) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 rounded-lg"
                >
                  {cat}
                  <button onClick={() => removeFilterItem('category', cat)} className="hover:text-red-500">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.subCategory?.map((sub: string) => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-300 rounded-lg"
                >
                  {sub}
                  <button onClick={() => removeFilterItem('subCategory', sub)} className="hover:text-red-500">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.brand?.map((b: string) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 rounded-lg"
                >
                  {b}
                  <button onClick={() => removeFilterItem('brand', b)} className="hover:text-red-500">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.make?.map((m: string) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 rounded-lg"
                >
                  {m}
                  <button onClick={() => removeFilterItem('make', m)} className="hover:text-red-500">
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

        {/* Product Results */}
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
          <NoResultsFallback
            searchTerm={searchTerm}
            category={filters.category?.[0]}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAllFilters}
            onSelectAlternativeQuery={(alt) => setSearchTerm(alt)}
            alternativeQueries={suggestions?.alternativeQueries}
            relatedCategories={suggestions?.relatedCategories}
            scope="GHUBA"
          />
        )}
      </main>
    </div>
  );
}

export default function ProductList() {
  return (
    <div className="mx-auto px-2.5 sm:px-4 lg:px-8 py-4 sm:py-8 bg-white dark:bg-gray-950 min-h-screen">
      <div className="mb-6 sm:mb-8 text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Explore Our Collection
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Discover vetted vehicles, electronics, lifestyle goods, and prime listings tailored for you.
        </p>
      </div>

      <ErrorBoundary
        fallback={
          <div className="flex items-center justify-center p-4 text-red-800 bg-red-50 dark:bg-red-500/10 rounded-xl">
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            <p>Failed to load products. Please refresh.</p>
          </div>
        }
      >
        <Suspense fallback={<div className="mt-8"><SkeletonGrid count={8} /></div>}>
          <ProductListContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}