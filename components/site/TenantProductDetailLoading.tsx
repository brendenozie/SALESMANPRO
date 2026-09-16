export default function TenantProductDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 animate-pulse pt-24">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-12 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="w-3 h-4 text-zinc-400">/</div>
          <div className="w-16 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="w-3 h-4 text-zinc-400">/</div>
          <div className="w-32 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Left: Product Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="w-full aspect-square rounded-3xl bg-zinc-200 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-center shadow-inner">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-300 dark:border-zinc-700 border-t-amber-500 animate-spin" />
            </div>
            {/* Thumbnail Row */}
            <div className="grid grid-cols-4 gap-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl bg-zinc-200 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-800"
                />
              ))}
            </div>
          </div>

          {/* Right: Product Info & Actions */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-start">
            {/* Category / Brand Pill */}
            <div className="flex items-center gap-3">
              <div className="w-24 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-16 h-6 rounded-full bg-emerald-500/20" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="w-4/5 h-8 rounded-xl bg-zinc-300 dark:bg-zinc-700" />
              <div className="w-2/3 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded bg-amber-400/30" />
                ))}
              </div>
              <div className="w-12 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Price Block */}
            <div className="flex items-baseline gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-sm">
              <div className="w-36 h-9 rounded-xl bg-zinc-300 dark:bg-zinc-700" />
              <div className="w-20 h-5 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Description Lines */}
            <div className="space-y-2.5 pt-2">
              <div className="w-full h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-11/12 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-3/4 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Variants / Options */}
            <div className="space-y-2 pt-2">
              <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex gap-2">
                <div className="w-28 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-28 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-28 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-4">
              <div className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-white/90 shadow-md" />
              <div className="w-full h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30" />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="h-10 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60" />
              <div className="h-10 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60" />
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="pt-12 border-t border-zinc-200/80 dark:border-zinc-800 space-y-6">
          <div className="flex justify-between items-center">
            <div className="w-48 h-6 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-20 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-3 shadow-sm"
              >
                <div className="aspect-square w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-3/4 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-1/2 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex justify-between items-center pt-2">
                  <div className="w-16 h-5 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
