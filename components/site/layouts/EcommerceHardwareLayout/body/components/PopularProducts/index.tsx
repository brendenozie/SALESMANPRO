'use client';

import React, { useRef } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  BoltIcon, 
  ArrowRightIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function HardwareDailyBestSells({ id }: { id: string }) {
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
    <section className="relative py-24 bg-zinc-50 dark:bg-[#050505] transition-colors duration-500 overflow-hidden">
      {/* Industrial Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20L0 40h40L20 20z' fill='%23${primaryColor.replace('#', '')}' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: High Impact Layout */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Inventory Clearance</span>
            </motion.div>
            
            <h2 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white leading-[0.8] tracking-tighter uppercase">
              Flash <span className="text-transparent" style={{ WebkitTextStroke: `2px ${primaryColor}` }}>Hardware</span> <br/> 
              <span className="flex items-center gap-4">Deals <BoltIcon className="h-12 w-12 text-amber-500" /></span>
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-1">
              <NavBtn icon={<ChevronLeftIcon className="w-6 h-6" />} onClick={() => scroll('left')} />
              <NavBtn icon={<ChevronRightIcon className="w-6 h-6" />} onClick={() => scroll('right')} />
            </div>
            
            <Link href="/hardwareecommerce/products?flag=isOnOffer" className="group h-16 flex items-center gap-4 px-8 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-900 font-black transition-all hover:bg-zinc-800 dark:hover:bg-amber-400">
              <span className="text-[10px] uppercase tracking-[0.2em]">Bulk Catalog</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
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
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[320px] md:w-[400px]"
              >
                <div className="h-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-2xl hover:border-amber-500 transition-all duration-300">
                    <ProductCard product={product} />
                </div>
              </motion.div>
            ))}
            
            {/* Industrial See All Card */}
            <motion.div 
              className="flex-shrink-0 w-[300px] relative overflow-hidden group border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="absolute inset-0 bg-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
              
              <div className="relative z-10 space-y-6">
                  <ArchiveBoxIcon className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 transition-colors" />
                  <div>
                      <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase group-hover:text-zinc-900">Entire<br/>Warehouse</h3>
                      <p className="mt-2 text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest group-hover:text-zinc-800">Clearance Pricing Applied</p>
                  </div>
              </div>
              
              <Link href="/hardwareecommerce/products?flag=isOnOffer" className="absolute inset-0" />
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
      className="w-16 h-16 flex items-center justify-center bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-900 hover:text-white dark:hover:bg-amber-500 dark:hover:text-zinc-900 transition-all"
    >
      {icon}
    </button>
  );
}