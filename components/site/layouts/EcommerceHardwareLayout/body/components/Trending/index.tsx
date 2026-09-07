'use client';

import React, { useRef } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import ProductCard from '../ProductShowcaseGrid/ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  FireIcon, 
  ArrowRightIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function HardwareTrendingProducts({ id }: { id: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { storeFormData } = useStoreContext();
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber

  // Using 'isTrending' or similar flag for this section
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const cacheKey = `products-${id}-trending`;
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
    <section className="relative py-24 bg-white dark:bg-[#0A0A0A] transition-colors duration-500 overflow-hidden">
      {/* Structural Grid Background */}
      <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(${primaryColor} 0.5px, transparent 0.5px)`, backgroundSize: '32px 32px' }} />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: Engineered Layout */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-l-4 border-amber-500"
            >
              <FireIcon className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 dark:text-zinc-400">Market Demand High</span>
            </motion.div>
            
            <h2 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white leading-[0.85] tracking-tighter uppercase">
              Trending <br />
              <span className="text-transparent" style={{ WebkitTextStroke: `1.5px ${primaryColor}` }}>Hardware</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex">
              <NavBtn icon={<ChevronLeftIcon className="w-6 h-6" />} onClick={() => scroll('left')} />
              <NavBtn icon={<ChevronRightIcon className="w-6 h-6" />} onClick={() => scroll('right')} />
            </div>
            
            <Link href="/hardwareecommerce/products" className="group h-20 flex items-center gap-6 px-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 transition-all hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-zinc-900">
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">View Full Catalog</span>
              <div className="w-8 h-px bg-current group-hover:w-12 transition-all" />
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide space-x-6 pb-12 -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth items-stretch"
          >
            {data.data.map((product: any, idx: number) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[310px] md:w-[380px]"
              >
                <div className="h-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors hover:border-amber-500 group">
                    <ProductCard product={product} />
                </div>
              </motion.div>
            ))}
            
            {/* The "Toolbox" See All Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex-shrink-0 w-[280px] relative bg-zinc-900 dark:bg-zinc-100 flex flex-col items-center justify-center p-12 text-center group overflow-hidden"
            >
              {/* Animated Rivet Detail */}
              <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-zinc-700 dark:bg-zinc-300" />
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-zinc-700 dark:bg-zinc-300" />
              <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-zinc-700 dark:bg-zinc-300" />
              <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-zinc-700 dark:bg-zinc-300" />

              <div className="relative z-10">
                <div className="w-20 h-20 border-2 border-amber-500 flex items-center justify-center mb-8 mx-auto rotate-45 group-hover:rotate-0 transition-transform duration-500">
                    <CpuChipIcon className="w-10 h-10 text-amber-500 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                </div>
                <h3 className="text-2xl font-black text-white dark:text-zinc-900 tracking-tighter uppercase leading-none">Complete<br/>Series</h3>
                <p className="mt-4 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em]">Built for Professionals</p>
              </div>
              
              <Link href="/hardwareecommerce/products" className="absolute inset-0" />
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
      className="w-20 h-20 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-95"
    >
      {icon}
    </button>
  );
}