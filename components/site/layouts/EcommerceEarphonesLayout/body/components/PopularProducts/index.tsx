'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { motion } from 'framer-motion';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function DailyBestSells({ id }: { id: string }) {
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const cacheKey = `products-${id}-isOnOffer`;
  const fetcher = createCachedFetcher(cacheKey);

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="py-20 bg-white dark:bg-[#050505]">
        <SkeletonGrid count={8} />
      </div>
    );
  }

  if (error || !data?.data?.length) return null;

  return (
    <section className="relative py-24 overflow-hidden bg-white dark:bg-[#050505]">
      {/* Background Glow */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]
          from-primary-color/10
          via-transparent
          to-transparent
          opacity-60
          pointer-events-none
        "
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon
                className="w-5 h-5"
                style={{ color: 'var(--primary-color)' }}
              />
              <span
                className="
                  text-[10px] font-black tracking-[0.4em] uppercase
                  text-gray-500 dark:text-white/40
                "
              >
                Limited Drops
              </span>
            </div>

            <h2
              className="
                text-4xl md:text-6xl font-black tracking-tighter italic uppercase
                text-gray-900 dark:text-white
              "
            >
              Daily{' '}
              <span
                className="text-primary-color"
                style={{ color: 'var(--primary-color)' }}
              >
                Essentials
              </span>
            </h2>
          </div>

          <button
            onClick={() =>
              (window.location.href = `/earphonesecommerce/products`)
            }
            className="
              group flex items-center gap-3
              px-6 py-3 rounded-full border transition-all
              bg-black/5 hover:bg-black/10 border-black/10
              text-gray-900
              dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10
              dark:text-white
            "
          >
            <span className="text-xs font-bold uppercase tracking-widest">
              View All Gear
            </span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Products */}
        <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto pb-8 md:pb-0 no-scrollbar snap-x snap-mandatory">
          {data.data.map((product: any) => (
            <div
              key={product.id}
              className="min-w-[85vw] md:min-w-0 snap-center"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}