'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { 
  ArrowRightIcon, 
  FireIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { motion } from 'framer-motion';
import { useRef } from 'react';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) return <div className="bg-[#050505] py-20"><SkeletonGrid count={8} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="relative py-24 bg-[#050505] border-t border-white/5">
      {/* Decorative Gradient Flare */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-color/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500"
            >
              <FireIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live Now</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none">
              Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Gear</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Custom Navigation for the Slider */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => scroll('left')}
                className="p-3 rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="p-3 rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
            
            <button 
              onClick={() => window.location.href = `/earphonesecommerce/products`}
              className="flex items-center gap-2 text-white/40 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors group"
            >
              See Full Rank <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* The "Runway" Slider */}
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
                {/* Ranking Number Decal */}
                <span className="absolute -top-4 -left-2 z-20 text-6xl font-black italic text-white/5 select-none pointer-events-none group-hover:text-white/10 transition-colors">
                  0{idx + 1}
                </span>
                <ProductCard product={product} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop Progress Bar */}
        <div className="hidden md:block w-full h-px bg-white/5 mt-4 relative">
          <motion.div 
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute top-0 left-0 h-px bg-primary-color"
            style={{ backgroundColor: 'var(--primary-color)' }}
          />
        </div>
      </div>
    </section>
  );
}