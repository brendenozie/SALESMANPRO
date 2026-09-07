'use client';

import React, { useRef } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowRightIcon, 
  PlusIcon 
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function DailyBestSells({ id }: { id: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { storeFormData } = useStoreContext();
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0D9488';

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
    <section className="relative py-32 bg-[#FDFDFB] dark:bg-zinc-950 transition-colors duration-500 overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-zinc-400">
                Seasonal Selections
              </span>
            </motion.div>
            
            <h2 className="text-6xl md:text-8xl font-serif text-zinc-900 dark:text-white leading-[0.85] tracking-tighter">
              Daily <span className="italic text-zinc-400 dark:text-zinc-600">Specials</span>
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-3">
              <NavBtn icon={<ChevronLeftIcon className="w-5 h-5" />} onClick={() => scroll('left')} />
              <NavBtn icon={<ChevronRightIcon className="w-5 h-5" />} onClick={() => scroll('right')} />
            </div>
            
            <Link 
              href="/bookecommerce/products?flag=isOnOffer" 
              className="group flex items-center gap-4 px-8 py-5 border border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-mono text-[10px] uppercase tracking-widest transition-all hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
            >
              <span>View All Archive</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Product Filmstrip */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide space-x-8 pb-12 -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth"
          >
            {data.data.map((product: any, idx: number) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[320px] md:w-[400px]"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
            
            {/* Minimalist "See All" Card */}
            <motion.div 
              className="flex-shrink-0 w-[300px] border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center p-12 text-center group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 border border-zinc-900 dark:border-white rounded-full flex items-center justify-center mb-8 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-500">
                  <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                </div>
                <h3 className="text-2xl font-serif italic text-zinc-900 dark:text-white">Full Collection</h3>
                <p className="mt-4 font-mono text-[9px] uppercase tracking-widest text-zinc-400">80+ Exclusive Offers</p>
              </div>
              <Link href="/products?flag=isOnOffer" className="absolute inset-0" />
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
      className="w-14 h-14 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
    >
      {icon}
    </button>
  );
}