export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 animate-pulse">
      {/* Page Title Skeleton */}
      <div className="w-56 h-8 mx-auto rounded-xl bg-zinc-200 dark:bg-zinc-800 mb-8" />

      {/* Responsive Categories Grid Skeleton */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
        {Array.from({ length: 15 }).map((_, idx) => (
          <div
            key={idx}
            className="relative bg-gradient-to-br from-amber-400/30 to-amber-500/20 dark:from-amber-600/20 dark:to-amber-700/10 p-5 rounded-2xl border border-amber-500/20 shadow-sm flex flex-col items-center justify-center h-36 sm:h-44 space-y-3"
          >
            {/* Icon Placeholder */}
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 dark:bg-amber-500/30" />
            {/* Name Line */}
            <div className="w-20 h-4 rounded-md bg-amber-500/30 dark:bg-amber-500/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
