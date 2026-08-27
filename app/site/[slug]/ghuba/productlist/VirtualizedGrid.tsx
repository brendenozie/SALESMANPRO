'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import MemoizedProductCard from './MemoizedProductCard';
import { SkeletonGrid } from "@/components/site/layouts/GhubaLayout/body/components/SkeletonGrid/SkeletonGrid";

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

  useEffect(() => {
    setMounted(true);
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumns(2);
      else if (window.innerWidth < 1024) setColumns(3);
      else setColumns(4);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const rows = useMemo(() => chunkArray(products, columns), [products, columns]);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 390,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

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
    <div className="flex flex-col">
      <div 
        className="relative w-full transition-all" 
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualItems.map((virtualRow) => {
          const rowProducts = rows[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement} // Ensures dynamic height works perfectly
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-6">
                {rowProducts.map((product) => (
                  <MemoizedProductCard
                    key={product.id ?? product._id}
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