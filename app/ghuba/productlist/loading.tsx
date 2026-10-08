import { SkeletonGrid } from "@/components/site/layouts/GhubaLayout/body/components/SkeletonGrid/SkeletonGrid";

export default function ProductListLoading() {
  return (
    <div className="mx-auto px-2.5 sm:px-4 lg:px-8 py-4 sm:py-8 bg-white dark:bg-gray-950 min-h-screen animate-pulse">
      {/* Top Banner Header Skeleton */}
      <div className="mb-6 sm:mb-8 text-center space-y-3">
        <div className="inline-block w-32 h-6 rounded-full bg-amber-500/20" />
        <div className="w-64 h-9 mx-auto rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="w-80 max-w-full h-4 mx-auto rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
      </div>

      {/* Main Grid: Filters Sidebar + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start">
        {/* Aside Filters Skeleton (visible on md+) */}
        <aside className="hidden md:block space-y-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800">
          <div className="w-24 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <div className="w-28 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-6 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800/60" />
              </div>
            ))}
          </div>
          <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-4" />
          <div className="w-20 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
          <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 mt-2" />
        </aside>

        {/* Product Grid Area Skeleton */}
        <main className="md:col-span-3 space-y-4">
          {/* Top Sort / Counter Bar */}
          <div className="flex justify-between items-center pb-2">
            <div className="w-32 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-28 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <SkeletonGrid count={9} />
        </main>
      </div>
    </div>
  );
}
