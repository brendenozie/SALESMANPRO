'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { motion } from 'framer-motion';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function DailyBestSells({ id }: { id: string }) {
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const cacheKey = `products-${id}-isOnOffer`;
  const fetcher = createCachedFetcher(cacheKey);

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  if (isLoading) return <div className="bg-[#050505] py-20"><SkeletonGrid count={8} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="relative py-24 bg-[#050505] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-color/5 via-transparent to-transparent opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-5 h-5 text-primary-color" style={{ color: 'var(--primary-color)' }} />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">Limited Drops</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">
              Daily <span className="text-primary-color" style={{ color: 'var(--primary-color)' }}>Essentials</span>
            </h2>
          </div>

          <button 
            onClick={() => window.location.href = `/ecommerce/products`}
            className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-full transition-all"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-white">View All Gear</span>
            <ArrowRightIcon className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Horizontal Scroll for Mobile, Grid for Desktop */}
        <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto pb-8 md:pb-0 no-scrollbar snap-x snap-mandatory">
          {data.data.map((product: any) => (
            <div key={product.id} className="min-w-[85vw] md:min-w-0 snap-center">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}