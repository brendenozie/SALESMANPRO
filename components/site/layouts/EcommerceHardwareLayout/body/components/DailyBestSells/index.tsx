'use client';

import React, { useRef } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ChevronLeftIcon, ChevronRightIcon, BoltIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function HardwareDailyDeals({ id }: { id: string }) {
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

  if (isLoading) return <div className="max-w-[1800px] mx-auto px-10 py-24"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="relative py-32 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden">
      {/* Industrial Spotlight Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[150px] opacity-[0.05] dark:opacity-[0.1]" style={{ backgroundColor: primaryColor }} />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundColor: primaryColor }} />
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: Tactical Layout */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8 border-l-4 border-zinc-900 dark:border-amber-500 pl-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-[0.4em]"
            >
              <BoltIcon className="w-3 h-3 text-amber-500" />
              <span>Live Inventory Clearance</span>
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white leading-none tracking-tighter uppercase italic">
              Daily <span className="text-transparent" style={{ WebkitTextStroke: '1px currentColor' }}>Best Sells</span>
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-3">
              <NavBtn icon={<ChevronLeftIcon className="w-5 h-5" />} onClick={() => scroll('left')} />
              <NavBtn icon={<ChevronRightIcon className="w-5 h-5" />} onClick={() => scroll('right')} />
            </div>
            
            <Link href="/hardwareecommerce/products" className="group flex items-center gap-4 px-8 py-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black transition-all hover:bg-amber-500 hover:text-zinc-900 shadow-2xl">
              <span className="text-[10px] uppercase tracking-[0.2em]">Full Catalog</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide space-x-6 pb-12 items-stretch"
          >
            {data.data.map((product: any, idx: number) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[320px] md:w-[400px]"
              >
                <div className="p-[1px] bg-gradient-to-b from-zinc-200 dark:from-zinc-800 to-transparent hover:from-amber-500 transition-colors duration-500">
                   <div className="bg-white dark:bg-zinc-950 h-full">
                      <ProductCard product={product} />
                   </div>
                </div>
              </motion.div>
            ))}
            
            {/* Logistic Terminal: "See All" Card */}
            <motion.div 
              whileHover={{ x: 10 }}
              className="flex-shrink-0 w-[300px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-amber-500 transition-colors"
            >
              <div 
                className="w-20 h-20 flex items-center justify-center text-zinc-900 dark:text-white border-2 border-zinc-900 dark:border-white mb-8 group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-500"
              >
                <ArrowRightIcon className="w-10 h-10 group-hover:rotate-[-45deg] transition-transform" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">Batch<br/>Requisition</h3>
              <p className="mt-4 text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Access 150+ Technical Lines</p>
              
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
      className="p-4 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 hover:text-amber-500 transition-all active:scale-90"
    >
      {icon}
    </button>
  );
}