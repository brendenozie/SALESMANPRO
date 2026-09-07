'use client';

import React, { useRef } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function DailyBestSells({ id }: { id: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { storeFormData } = useStoreContext();
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF8FA3';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#70D6FF';

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
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) return <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="relative py-24 bg-white dark:bg-zinc-950 transition-colors duration-500 overflow-hidden">
      {/* Soft Nursery Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ backgroundColor: `${primaryColor}33` }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ backgroundColor: `${secondaryColor}22` }} />
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header with Magazine-style Layout */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800"
            >
              <SparklesIcon className="w-4 h-4" style={{ color: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Limited Arrivals</span>
            </motion.div>
            
            <h2 className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white leading-[0.9] tracking-tighter">
              Trending <span style={{ color: primaryColor }}>Products</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-2">
              <NavBtn icon={<ChevronLeftIcon className="w-6 h-6" />} onClick={() => scroll('left')} />
              <NavBtn icon={<ChevronRightIcon className="w-6 h-6" />} onClick={() => scroll('right')} />
            </div>
            
            <Link href="/babyecommerce/products" className="group flex items-center gap-3 px-6 py-4 rounded-3xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold transition-all hover:scale-105 active:scale-95">
              <span className="text-xs uppercase tracking-widest">View All</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Product Carousel with Shadow Masking */}
        <div className="relative">
          {/* Edge Fades for Cinematic Effect */}
          <div className="absolute -left-2 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent z-20 pointer-events-none hidden lg:block" />
          <div className="absolute -right-2 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent z-20 pointer-events-none hidden lg:block" />

          <div 
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide space-x-8 pb-12 -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth items-stretch"
          >
            {data.data.map((product: any, idx: number) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[300px] md:w-[360px]"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
            
            {/* Artistic "See All" Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="flex-shrink-0 w-[260px] relative rounded-[3.5rem] overflow-hidden group border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center p-10 text-center"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" 
                style={{ backgroundColor: primaryColor }} 
              />
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white mb-6 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
                style={{ backgroundColor: primaryColor }}
              >
                <ArrowRightIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Discover<br/>More Magic</h3>
              <p className="mt-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Explore 50+ Offers</p>
              
              <Link href="/babyecommerce/products" className="absolute inset-0" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NavBtn({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="p-5 rounded-[2rem] bg-white dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-900 dark:hover:border-white transition-all shadow-sm active:scale-90"
    >
      {icon}
    </button>
  );
}