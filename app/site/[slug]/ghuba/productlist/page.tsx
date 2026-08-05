'use client';

import { useState, useMemo, useTransition, useDeferredValue, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import { MagnifyingGlassIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      <aside className="md:sticky md:top-24 z-10 self-start">
        <Filters 
          filters={filters} 
          setFilters={handleFilterUpdate} 
          searchTerm={searchTerm}
          onSearch={setSearchTerm} 
        />
      </aside>

      <main className="md:col-span-3 min-h-[50vh]">
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
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
            <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-full mb-6">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
            <button
              onClick={() => handleFilterUpdate({ ...filters, brand: [], category: [], subCategory: [] })}
              className="mt-6 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProductList() {
  return (
    <div className="mx-auto p-4 bg-white dark:bg-gray-950 min-h-screen">
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-8 text-gray-900 dark:text-white">
        Explore Our Collection
      </h2>
      <ErrorBoundary fallback={
        <div className="flex items-center justify-center p-4 text-red-800 bg-red-50 rounded-xl">
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