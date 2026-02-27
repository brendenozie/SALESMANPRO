"use client";

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowUpRightIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { motion } from 'framer-motion';
import { useRef } from 'react';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-6 py-20"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-28 bg-[#F9F6F3] relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-rose-50 rounded-full blur-[120px] opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header: Editorial Layout */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-rose-500 mb-6"
            >
              <SparklesIcon className="w-5 h-5" />
              <span className="text-[11px] font-bold uppercase tracking-[0.5em]">The Elite Selection</span>
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl font-serif italic text-slate-900 leading-[0.9]">
              Best <span className="text-slate-400">of the</span> <br />
              Season
            </h2>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-6">
            <p className="text-slate-500 text-sm max-w-[280px] lg:text-right leading-relaxed italic">
              "A curated collection of our most beloved stems, now available for a short window of time."
            </p>
            
            <div className="flex items-center gap-3">
              {/* Navigation Controls */}
              <button 
                onClick={() => scroll('left')}
                className="group p-4 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-slate-900 transition-all duration-500"
              >
                <ChevronLeftIcon className="w-5 h-5 text-slate-900 group-hover:text-white" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="group p-4 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-slate-900 transition-all duration-500"
              >
                <ChevronRightIcon className="w-5 h-5 text-slate-900 group-hover:text-white" />
              </button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={() => window.location.href = `/ecommerce/products`}
                className="ml-4 h-14 w-14 flex items-center justify-center bg-rose-500 text-white rounded-full shadow-xl shadow-rose-200"
              >
                <ArrowUpRightIcon className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Product Carousel: High-Depth Cards */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-10 pb-16 snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {data.data.map((product: any, idx: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="min-w-[300px] md:min-w-[380px] snap-start"
            >
              <div className="bg-white p-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-700">
                 <ProductCard product={product} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Boutique Trust Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-slate-200/60">
          {[
            { label: "Freshness Guaranteed", sub: "Cut to order" },
            { label: "Hand Wrapped", sub: "Silk paper & ribbons" },
            { label: "Fast Delivery", sub: "Within 24 hours" },
            { label: "Floral Care", sub: "Nutrient kit included" }
          ].map((item, i) => (
            <div key={i} className="text-center md:text-left">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 mb-1">{item.label}</h4>
              <p className="text-xs text-slate-400 italic font-serif">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}