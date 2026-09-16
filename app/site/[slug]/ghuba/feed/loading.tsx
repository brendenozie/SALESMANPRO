export default function GhubaFeedLoading() {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-white flex flex-col justify-between p-4 sm:p-6 select-none animate-pulse">
      {/* Top Header Filter Skeletons */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto pt-2 z-20">
        <div className="w-10 h-10 rounded-full bg-zinc-800/80" />
        <div className="flex items-center gap-2">
          <div className="w-16 h-8 rounded-full bg-zinc-800/80" />
          <div className="w-20 h-8 rounded-full bg-amber-500/20 border border-amber-500/30" />
          <div className="w-16 h-8 rounded-full bg-zinc-800/80" />
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-800/80" />
      </div>

      {/* Central Video Poster Shimmer Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black z-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/40 border-t-amber-500 animate-spin" />
        </div>
      </div>

      {/* Right-Side Action Icons */}
      <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-zinc-800/90 border border-zinc-700/50" />
            <div className="w-6 h-2 rounded bg-zinc-800/80" />
          </div>
        ))}
      </div>

      {/* Bottom Product Info & Seller Badge */}
      <div className="relative z-20 w-full max-w-md pb-6 space-y-3">
        {/* Seller pill */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700" />
          <div className="w-28 h-4 rounded-full bg-zinc-800" />
        </div>

        {/* Title and price lines */}
        <div className="space-y-2">
          <div className="w-3/4 h-5 rounded-lg bg-zinc-800" />
          <div className="w-1/2 h-4 rounded-lg bg-zinc-800/80" />
        </div>

        {/* Price tag */}
        <div className="w-24 h-6 rounded-lg bg-amber-500/20" />
      </div>
    </div>
  );
}
