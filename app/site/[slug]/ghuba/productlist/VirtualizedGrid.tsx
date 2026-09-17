'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import MemoizedProductCard from './MemoizedProductCard';
import { SkeletonGrid } from "@/components/site/layouts/GhubaLayout/body/components/SkeletonGrid/SkeletonGrid";
import { storefrontPerformanceConfig } from '@/lib/performance/storefrontConfig';
import { useScrollPositionPersistence } from '@/hooks/useScrollPositionPersistence';

const SCROLL_STORAGE_KEY = 'ghuba_productlist_scroll_pos';

const chunkArray = (arr: any[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

export default function VirtualizedGrid({
  products,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: any) {
  const [columns, setColumns] = useState(4);
  const [mounted, setMounted] = useState(false);
  const [scrollMargin, setScrollMargin] = useState(0);
  const parentRef = useRef<HTMLDivElement>(null);

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  const perfSettings = storefrontPerformanceConfig.getSettings(isMobile);

  const { restoreScrollPosition } = useScrollPositionPersistence({
    storageKey: SCROLL_STORAGE_KEY,
    debounceMs: perfSettings.scrollPersistenceDebounceMs,
  });

  useEffect(() => {
    setMounted(true);
    const updateDimensions = () => {
      if (window.innerWidth < 640) setColumns(2);
      else if (window.innerWidth < 1024) setColumns(3);
      else setColumns(4);

      if (parentRef.current) {
        setScrollMargin(parentRef.current.offsetTop);
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const rows = useMemo(() => chunkArray(products, columns), [products, columns]);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => storefrontPerformanceConfig.getEstimatedRowHeight(typeof window !== 'undefined' && window.innerWidth < 640),
    overscan: isMobile ? storefrontPerformanceConfig.mobile.overscanRows : storefrontPerformanceConfig.desktop.overscanRows,
    scrollMargin,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Restore scroll position after rows have mounted and rendered
  useEffect(() => {
    if (!mounted || rows.length === 0) return;
    restoreScrollPosition();
  }, [mounted, rows.length]);

  // NATIVE INFINITE SCROLL: Triggers based on the virtualizer's rendered items
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    
    if (!lastItem) return;

    // If the last rendered row is the last available row in our data, fetch more
    if (
      lastItem.index >= rows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [virtualItems, hasNextPage, isFetchingNextPage, fetchNextPage, rows.length]);

  if (!mounted) {
    return (
      <div className="py-8">
        <SkeletonGrid count={8} />
      </div>
    );
  }

  return (
    <div ref={parentRef} className="flex flex-col">
      <div 
        className="relative w-full" 
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualItems.map((virtualRow) => {
          const rowProducts = rows[virtualRow.index];
          return (
            <div
              key={virtualRow.key.toString()}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement} // Ensures dynamic height works perfectly
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualRow.start - scrollMargin}px)` }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 pb-4 sm:pb-6">
                {rowProducts.map((product) => (
                  <MemoizedProductCard
                    key={String(product.id || product._id || product.slug || '')}
                    product={product}
                    isPriority={virtualRow.index === 0}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {isFetchingNextPage && (
        <div className="mt-8 w-full">
          <SkeletonGrid count={columns} />
        </div>
      )}
    </div>
  );
}