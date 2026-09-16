export default function TenantProductListLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 animate-pulse pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="space-y-2">
            <div className="w-48 h-8 rounded-xl bg-zinc-300 dark:bg-zinc-700" />
            <div className="w-64 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-64 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-32 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
          </div>
        </div>

        {/* Main Content: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar Skeleton */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-6 shadow-sm">
              <div className="w-24 h-5 rounded-lg bg-zinc-300 dark:bg-zinc-700" />
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="w-28 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="w-6 h-4 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="w-24 h-4 rounded bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-full h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="lg:col-span-9 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-3 shadow-sm"
                >
                  <div className="aspect-square w-full rounded-xl bg-zinc-200 dark:bg-zinc-800/80" />
                  <div className="w-3/4 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="w-1/2 h-3 rounded bg-zinc-100 dark:bg-zinc-800/70" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="w-16 h-5 rounded bg-zinc-300 dark:bg-zinc-700" />
                    <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
