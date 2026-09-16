export default function ProductViewLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 pb-32 animate-pulse">
      {/* Top Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-12 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <div className="w-20 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <div className="w-32 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>

      {/* Main Product Hero Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Image Gallery Shimmer */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Aspect-Square Hero Image Placeholder */}
            <div className="relative aspect-square w-full rounded-3xl bg-zinc-200 dark:bg-zinc-900 overflow-hidden border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
            </div>

            {/* Thumbnail Row Placeholder */}
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-2xl bg-zinc-200 dark:bg-zinc-900 shrink-0 border border-zinc-200/60 dark:border-zinc-800"
                />
              ))}
            </div>
          </div>

          {/* Right Column: Pricing & Action Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Category / Badge */}
            <div className="w-24 h-5 rounded-full bg-amber-500/20" />

            {/* Title Skeleton */}
            <div className="space-y-2">
              <div className="w-full h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-3/4 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Seller Info Row */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-1">
                <div className="w-28 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-16 h-3 rounded bg-zinc-200 dark:bg-zinc-800/80" />
              </div>
            </div>

            {/* Sticky Pricing Shell */}
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="space-y-1.5">
                <div className="w-24 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-48 h-10 rounded-xl bg-zinc-300 dark:bg-zinc-700" />
              </div>

              {/* Status block */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-6 h-6 rounded-full bg-emerald-500/20" />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="w-full h-14 rounded-2xl bg-amber-500/80" />
                <div className="w-full h-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Content: Description & Specs Shimmer */}
        <div className="mt-16 max-w-4xl space-y-6">
          <div className="w-40 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-2">
            <div className="w-full h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-full h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-2/3 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
