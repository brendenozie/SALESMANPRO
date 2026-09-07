'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import {
  ArrowRightIcon,
  FireIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { motion } from 'framer-motion';
import { useRef } from 'react';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function TrendingProducts({ id }: { id: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=trending&limit=8`;
  const cacheKey = `products-${id}-trending`;
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
      <div className="bg-white dark:bg-[#050505] py-20">
        <SkeletonGrid count={8} />
      </div>
    );

  if (error || !data?.data?.length) return null;

  return (
    <section className="relative py-24 bg-white dark:bg-[#050505] border-t border-black/5 dark:border-white/5 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-color/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="
                inline-flex items-center gap-2 px-3 py-1 rounded-full
                bg-orange-500/10 border border-orange-500/20 text-orange-600
                dark:text-orange-400
              "
            >
              <FireIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Live Now
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none text-black dark:text-white">
              Trending{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-black/30 dark:from-white dark:to-white/20">
                Gear
              </span>
            </h2>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Slider Nav */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="
                  p-3 rounded-full border
                  border-black/10 text-black hover:bg-black hover:text-white
                  dark:border-white/10 dark:text-white dark:hover:bg-white dark:hover:text-black
                  transition-all
                "
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="
                  p-3 rounded-full border
                  border-black/10 text-black hover:bg-black hover:text-white
                  dark:border-white/10 dark:text-white dark:hover:bg-white dark:hover:text-black
                  transition-all
                "
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() =>
                (window.location.href = `/earphonesecommerce/products`)
              }
              className="
                flex items-center gap-2 text-black/50 hover:text-black
                dark:text-white/40 dark:hover:text-white
                font-bold text-xs uppercase tracking-widest transition-colors group
              "
            >
              See Full Rank
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-10"
        >
          {data.data.map((product: any, idx: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="min-w-[280px] md:min-w-[320px] lg:min-w-[calc(25%-18px)] snap-start"
            >
              <div className="relative">
                {/* Ranking Number */}
                <span
                  className="
                    absolute -top-4 -left-2 z-20 text-6xl font-black italic
                    text-black/5 dark:text-white/5
                    select-none pointer-events-none
                  "
                >
                  0{idx + 1}
                </span>

                <ProductCard product={product} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="hidden md:block w-full h-px bg-black/5 dark:bg-white/5 mt-4 relative">
          <motion.div
            initial={{ width: '0%' }}
            whileInView={{ width: '100%' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute top-0 left-0 h-px bg-primary-color"
            style={{ backgroundColor: 'var(--primary-color)' }}
          />
        </div>
      </div>
    </section>
  );
}