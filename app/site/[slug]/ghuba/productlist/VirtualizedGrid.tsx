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
        const rect = parentRef.current.getBoundingClientRect();
        setScrollMargin(rect.top + window.scrollY);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions, { passive: true });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && parentRef.current?.parentElement) {
      ro = new ResizeObserver(() => updateDimensions());
      ro.observe(parentRef.current.parentElement);
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
      ro?.disconnect();
    };
  }, []);

  const rows = useMemo(() => chunkArray(products, columns), [products, columns]);

  // Buffer rows ensure that aggressive touch flings never expose a blank gap
  // while the next page is in transit over the network.
  const bufferRowCount = hasNextPage ? (isFetchingNextPage ? 6 : 4) : 0;
  const totalRowCount = rows.length + bufferRowCount;

  const virtualizer = useWindowVirtualizer({
    count: totalRowCount,
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

  // Proactive prefetch: triggers 6 rows ahead of the bottom so next page arrives before fling completes
  useEffect(() => {
    if (!virtualItems.length || !hasNextPage || isFetchingNextPage) return;
    const lastItem = virtualItems[virtualItems.length - 1];
    if (lastItem && lastItem.index >= Math.max(0, rows.length - 6)) {
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
          const isBufferRow = virtualRow.index >= rows.length;
          const rowProducts = isBufferRow ? [] : rows[virtualRow.index];

          return (
            <div
              key={virtualRow.key.toString()}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualRow.start - scrollMargin}px)` }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 pb-4 sm:pb-6">
                {isBufferRow ? (
                  Array.from({ length: columns }).map((_, cIdx) => (
                    <div
                      key={cIdx}
                      className="h-full aspect-[3/4] rounded-2xl sm:rounded-3xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse border border-zinc-200/50 dark:border-zinc-700/50"
                    />
                  ))
                ) : (
                  rowProducts.map((product) => (
                    <MemoizedProductCard
                      key={String(product.id || product._id || product.slug || '')}
                      product={product}
                      isPriority={virtualRow.index === 0}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading Skeleton Indicator when fetching more */}
      {isFetchingNextPage && bufferRowCount === 0 && (
        <div className="mt-8 w-full">
          <SkeletonGrid count={columns} />
        </div>
      )}
    </div>
  );
}