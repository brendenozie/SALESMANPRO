'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import {
  ArrowRightIcon,
  BoltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { motion } from 'framer-motion';
import { useRef } from 'react';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function DailyBestSells({ id }: { id: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const cacheKey = `products-${id}-isOnOffer`;
  const fetcher = createCachedFetcher(cacheKey);

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left:
        direction === 'left'
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth,
      behavior: 'smooth',
    });
  };

  if (isLoading)
    return (
      <div className="py-20 bg-white dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 mb-10 h-10 w-48 rounded-lg bg-black/5 dark:bg-white/5 animate-pulse" />
        <SkeletonGrid count={4} />
      </div>
    );

  if (error || !data?.data?.length) return null;

  return (
    <section className="relative py-24 overflow-hidden bg-white dark:bg-[#050505]">
      {/* Ambient Accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                bg-black/5 dark:bg-white/5
                border border-black/10 dark:border-white/10"
            >
              <BoltIcon className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60 dark:text-white/70">
                Flash Offers
              </span>
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-[0.8] text-black dark:text-white">
              Daily <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
                Best Sells.
              </span>
            </h2>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-end gap-6">
            <div className="flex gap-2">
              {(['left', 'right'] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => scroll(dir)}
                  className="
                    p-4 rounded-2xl
                    border border-black/10 dark:border-white/10
                    text-black dark:text-white
                    hover:bg-black hover:text-white
                    dark:hover:bg-white dark:hover:text-black
                    transition-all active:scale-95
                  "
                >
                  {dir === 'left' ? (
                    <ChevronLeftIcon className="w-5 h-5" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                (window.location.href = `/earphonesecommerce/products`)
              }
              className="text-xs font-bold uppercase tracking-widest
                text-black/40 dark:text-white/40
                hover:text-orange-500 transition-colors
                flex items-center gap-2 group"
            >
              Enter the Vault
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-12"
        >
          {data.data.map((product: any, idx: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="min-w-[85vw] md:min-w-[350px] lg:min-w-[calc(25%-18px)] snap-center"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Progress Track */}
        <div className="w-full h-[2px] rounded-full overflow-hidden bg-black/5 dark:bg-white/5">
          <motion.div
            initial={{ width: '0%' }}
            whileInView={{ width: '30%' }}
            transition={{ duration: 2, ease: 'circOut' }}
            className="h-full bg-gradient-to-r from-orange-600 to-amber-400"
          />
        </div>
      </div>
    </section>
  );
}