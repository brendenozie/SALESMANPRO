"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import ProductCard from '@/components/site/layouts/EcommerceAccessoriesLayout/body/components/ProductCard';
import { JsonValue } from "@prisma/client/runtime/library";
import { MarketListingForm } from "@/types/typings";


export default function VirtualizedGrid({ items, columnCount = 4 }: {
  items: MarketListingForm[];
  columnCount?: number;
}) {
  const parentRef = useRef(null);

  const rowCount = Math.ceil(items.length / columnCount);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280, // height estimate – tweak
    overscan: 4,
  });

  return (
    <div
      ref={parentRef}
      className="h-[70vh] overflow-auto rounded-lg border bg-white dark:bg-gray-900"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowStart = virtualRow.index * columnCount;
          const visibleItems = items.slice(
            rowStart,
            rowStart + columnCount
          );

          return (
            <div
              key={virtualRow.key.toString()}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-2"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {visibleItems.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
