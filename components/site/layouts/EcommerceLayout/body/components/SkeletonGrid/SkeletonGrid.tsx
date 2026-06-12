import React from 'react';

interface SkeletonGridProps {
  count?: number;
}

export function SkeletonGrid({ count = 8 }: SkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-4 max-w-7xl mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 flex flex-col gap-3 shadow-sm"
        >
          {/* Shimmer Effect Overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5" />

          {/* Media/Image Placeholder */}
          <div className="aspect-square w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />

          {/* Content Content Stack */}
          <div className="flex flex-col gap-2 flex-1 justify-between">
            <div className="space-y-2">
              {/* Primary Title Line */}
              <div className="h-4 w-3/4 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
              
              {/* Secondary Subtitle Line */}
              <div className="h-3 w-1/2 rounded-md bg-gray-150 dark:bg-gray-800/60 animate-pulse" />
            </div>

            {/* Bottom Meta/Action Row */}
            <div className="flex items-center justify-between pt-2 mt-auto">
              {/* Price / Badge */}
              <div className="h-5 w-16 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
              {/* Action Button Icon */}
              <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}