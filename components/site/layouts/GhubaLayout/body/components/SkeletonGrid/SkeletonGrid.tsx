import React from 'react';

interface SkeletonGridProps {
  count?: number;
  className?: string;
}

/**
 * Pixel-perfect skeleton replica of GhubaProductCard.
 * Ensures zero layout-shift, exact border radii, and correct dark-mode tones (#080808/zinc-900)
 * to prevent white or gray flashes during initial load and fast scroll flings.
 */
export function GhubaProductCardSkeleton() {
  return (
    <div className="relative h-full rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col shadow-sm">
      {/* --- IMAGE HEADER SKELETON --- */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-200/50 via-zinc-100/50 to-zinc-200/50 dark:from-zinc-900 dark:via-zinc-800/80 dark:to-zinc-900 animate-pulse" />

        {/* Top Right Quick Action Placeholders */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 pointer-events-none">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70" />
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70" />
        </div>
      </div>

      {/* --- PRODUCT INFO SKELETON --- */}
      <div className="p-2.5 sm:p-3.5 md:p-5 flex flex-col flex-grow justify-between gap-2.5 sm:gap-3.5">
        <div className="space-y-2">
          {/* Primary Title Line */}
          <div className="h-3.5 sm:h-4 w-4/5 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          {/* Secondary Subtitle / Category Line */}
          <div className="h-3 w-3/5 rounded-md bg-zinc-200/70 dark:bg-zinc-800/60 animate-pulse" />
          {/* Verified Store Byline */}
          <div className="h-2.5 w-2/5 rounded bg-zinc-200/50 dark:bg-zinc-800/40 animate-pulse pt-0.5" />
        </div>

        {/* Bottom Price & Action Button Row */}
        <div className="flex items-center justify-between pt-2.5 sm:pt-3 mt-auto border-t border-zinc-100 dark:border-zinc-800/70">
          {/* Price Placeholder */}
          <div className="h-5 sm:h-6 w-20 sm:w-24 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          {/* Button Placeholder */}
          <div className="h-7 sm:h-8 w-16 sm:w-20 rounded-xl bg-amber-500/20 dark:bg-amber-500/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ 
  count = 8, 
  className = "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 w-full" 
}: SkeletonGridProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <GhubaProductCardSkeleton key={i} />
      ))}
    </div>
  );
}