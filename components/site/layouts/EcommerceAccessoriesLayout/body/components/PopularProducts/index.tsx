'use client';

import React, { useRef } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import ProductCard from '../ProductShowcaseGrid/ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  BoltIcon, 
  ArrowRightIcon,
  ArchiveBoxIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function AutomotiveFlashDeals({ id }: { id: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { storeFormData } = useStoreContext();
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber

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

  if (isLoading) return <div className="py-20 bg-zinc-50 dark:bg-[#050505]"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="relative py-24 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden border-t border-zinc-200 dark:border-zinc-900">
      
      {/* High-Performance Texture Overlay (Carbon Fiber / Mesh vibe) */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none mix-blend-overlay" 
           style={{ 
             backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`, 
             backgroundSize: '24px 24px' 
           }} 
      />

      {/* Decorative Ambient Glow */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-full opacity-10 dark:opacity-20 blur-[150px] pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${primaryColor}, transparent 70%)` }}
      />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: High Impact Dashboard Layout */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 mb-6 px-4 py-2 border border-red-500/30 bg-red-500/10 rounded-none"
            >
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-red-600 dark:text-red-500">
                Live Clearance Event
              </span>
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-zinc-900 dark:text-white leading-[0.85] tracking-tighter uppercase">
              Performance <br/>
              <span className="flex items-center gap-4 mt-2">
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, #ea580c)` }}>
                  Upgrades
                </span>
                <BoltIcon className="h-10 w-10 md:h-16 md:w-16 text-amber-500 animate-pulse" style={{ filter: `drop-shadow(0 0 10px ${primaryColor})` }} />
              </span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="hidden md:flex gap-2">
              <NavBtn icon={<ChevronLeftIcon className="w-5 h-5" />} onClick={() => scroll('left')} />
              <NavBtn icon={<ChevronRightIcon className="w-5 h-5" />} onClick={() => scroll('right')} />
            </div>
            
            <Link 
              href="/automotiveecommerce/products?flag=isOnOffer" 
              className="group relative h-14 md:h-16 flex items-center gap-4 px-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black overflow-hidden transition-transform active:scale-95"
            >
              <div className="absolute inset-0 w-full h-full bg-amber-500 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              <span className="relative z-10 text-[10px] md:text-xs uppercase tracking-[0.2em] group-hover:text-zinc-900 transition-colors duration-300">
                View All Deals
              </span>
              <ArrowRightIcon className="relative z-10 w-4 h-4 group-hover:translate-x-2 transition-all duration-300 group-hover:text-zinc-900" />
            </Link>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative group/carousel">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide space-x-6 pb-12 -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth items-stretch snap-x snap-mandatory"
          >
            {data.data.map((product: any, idx: number) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
                viewport={{ once: true, amount: 0.1 }}
                className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[380px] snap-center md:snap-start"
              >
                <div className="h-full border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0a0a0a] hover:border-amber-500 dark:hover:border-amber-500 transition-colors duration-300 relative group overflow-hidden">
                  {/* Subtle hover accent line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20" />
                  <ProductCard product={product} />
                </div>
              </motion.div>
            ))}
            
            {/* Industrial "See All" Card */}
            <motion.div 
              className="flex-shrink-0 w-[280px] sm:w-[320px] relative overflow-hidden group border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col items-center justify-center p-12 text-center snap-center md:snap-start hover:border-amber-500 transition-colors cursor-pointer"
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/10 group-hover:to-amber-500/20 transition-all duration-500" />
              
              <div className="relative z-10 flex flex-col items-center space-y-6">
                  <div className="w-20 h-20 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center bg-white dark:bg-zinc-900 group-hover:scale-110 group-hover:border-amber-500 transition-all duration-500 shadow-xl">
                    <SparklesIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div>
                      <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">
                        Unlock<br/>Full Catalog
                      </h3>
                      <p className="mt-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
                        View Inventory <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </p>
                  </div>
              </div>
              
              <Link href="/automotiveecommerce/products?flag=isOnOffer" className="absolute inset-0 z-20 focus:outline-none focus:ring-2 focus:ring-amber-500" aria-label="View all flash deals" />
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
      className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-transparent text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-900 hover:text-white dark:hover:bg-amber-500 dark:hover:text-zinc-900 dark:hover:border-amber-500 transition-all active:scale-95"
      aria-label="Scroll"
    >
      {icon}
    </button>
  );
}