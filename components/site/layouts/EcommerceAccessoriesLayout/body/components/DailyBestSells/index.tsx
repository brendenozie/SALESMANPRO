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
  WrenchScrewdriverIcon 
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function AutomotiveDailyDeals({ id }: { id: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { storeFormData } = useStoreContext();
  
  // Defaulting to a high-energy racing red if no theme color is set
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#EF4444'; 

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
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 1.2 : scrollLeft + clientWidth / 1.2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) return <div className="py-20 bg-zinc-50 dark:bg-zinc-950"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="relative py-32 bg-white dark:bg-[#09090b] transition-colors duration-500 overflow-hidden">
      
      {/* Dynamic Garage Lighting & Texture Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid/track pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Headlight Flares */}
        <div 
          className="absolute -top-[20%] right-[10%] w-[800px] h-[800px] rounded-full blur-[160px] opacity-[0.08] dark:opacity-[0.15]" 
          style={{ backgroundColor: primaryColor }} 
        />
        <div 
          className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.05] dark:opacity-[0.1]" 
          style={{ backgroundColor: primaryColor }} 
        />
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: High-Performance Layout */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8 relative">
          {/* Accent Line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full" style={{ backgroundColor: primaryColor }} />
          
          <div className="space-y-4 pl-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <FireIcon className="w-4 h-4 animate-pulse" style={{ color: primaryColor }} />
              <span>Flash Sale // Pit Stop Deals</span>
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white leading-none tracking-tighter uppercase italic">
              High-Octane <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-900 dark:from-zinc-400 dark:to-white">
                Offers
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-6 pl-6 lg:pl-0">
            <div className="hidden md:flex gap-2">
              <NavBtn icon={<ChevronLeftIcon className="w-6 h-6" />} onClick={() => scroll('left')} primaryColor={primaryColor} />
              <NavBtn icon={<ChevronRightIcon className="w-6 h-6" />} onClick={() => scroll('right')} primaryColor={primaryColor} />
            </div>
            
            <Link 
              href="/automotiveecommerce/products" 
              className="group relative flex items-center gap-4 px-8 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all hover:scale-[1.02]"
            >
              {/* Hover racing stripe effect */}
              <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" style={{ backgroundColor: primaryColor }} />
              
              <span className="relative z-10 text-[11px] uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                View Full Garage
              </span>
              <ArrowRightIcon className="relative z-10 w-5 h-5 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </Link>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative -mx-6 px-6 md:mx-0 md:px-0">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide space-x-6 pb-12 items-stretch"
          >
            {data.data.map((product: any, idx: number) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                viewport={{ once: true, margin: "-50px" }}
                className="flex-shrink-0 w-[85vw] sm:w-[340px] md:w-[420px] snap-center md:snap-start group"
              >
                {/* Sleek Automotive Card Wrapper */}
                <div className="relative h-full p-[1px] rounded-xl bg-gradient-to-b from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900/50 transition-all duration-500 group-hover:shadow-2xl" 
                     style={{ '--hover-color': primaryColor } as React.CSSProperties}>
                  
                  {/* Glowing border on hover */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" style={{ backgroundColor: primaryColor, opacity: 0.2 }} />
                  
                  <div className="relative h-full bg-white dark:bg-zinc-950 rounded-xl overflow-hidden z-10">
                    <ProductCard product={product} />
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* The "Garage" / See All Card */}
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="flex-shrink-0 w-[85vw] sm:w-[320px] snap-center md:snap-start relative overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-12 text-center group cursor-pointer transition-all"
            >
              {/* Checkered flag subtle background */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-[repeating-conic-gradient(#808080_0%_25%,transparent_0%_50%)] bg-[size:32px_32px]" />
              
              <div 
                className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-zinc-900 dark:text-white bg-white dark:bg-zinc-950 shadow-xl mb-8 group-hover:rotate-12 transition-transform duration-500"
              >
                <WrenchScrewdriverIcon className="w-10 h-10" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                  <ArrowRightIcon className="w-4 h-4" />
                </div>
              </div>
              
              <h3 className="relative z-10 text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">
                Enter The <br/>Garage
              </h3>
              <p className="relative z-10 mt-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">
                Browse All Spares & Accessories
              </p>
              
              <Link href="/automotiveecommerce/products" className="absolute inset-0 z-20" aria-label="View all products" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NavBtn({ icon, onClick, primaryColor }: { icon: React.ReactNode, onClick: () => void, primaryColor: string }) {
  return (
    <button 
      onClick={onClick}
      className="p-4 rounded-full bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:text-white hover:border-transparent transition-all active:scale-90 group relative overflow-hidden"
    >
      <div className="absolute inset-0 w-full h-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out rounded-full" style={{ backgroundColor: primaryColor }} />
      <span className="relative z-10 group-hover:text-white transition-colors">
        {icon}
      </span>
    </button>
  );
}