export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 animate-pulse">
      {/* Hero / Banner Skeleton */}
      <div className="w-full h-64 sm:h-80 md:h-96 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
      </div>

      {/* Store Identity Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl">
          {/* Store Logo Placeholder */}
          <div className="w-24 h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-md shrink-0" />
          <div className="space-y-2 text-center sm:text-left flex-grow">
            <div className="w-48 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 mx-auto sm:mx-0" />
            <div className="w-64 h-4 rounded bg-zinc-100 dark:bg-zinc-800/80 mx-auto sm:mx-0" />
          </div>
          <div className="w-32 h-10 rounded-2xl bg-amber-500/20" />
        </div>
      </div>

      {/* Featured Products Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="flex justify-between items-center">
          <div className="w-36 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="w-20 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-3 shadow-sm"
            >
              <div className="aspect-square w-full rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              <div className="w-3/4 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-1/2 h-3 rounded bg-zinc-100 dark:bg-zinc-800/80" />
              <div className="flex justify-between items-center pt-2">
                <div className="w-16 h-5 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
