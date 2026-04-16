'use client';

import React, { useRef } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  PlusIcon,
  ShoppingBagIcon 
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function BestSellsSection({ id }: { id: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0D9488';

  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const cacheKey = `products-${id}-bestsells`;
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

  if (isLoading) return <div className="max-w-[1600px] mx-auto px-10 py-32"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="relative py-32 bg-[#FDFDFB] dark:bg-zinc-950 transition-colors duration-500 overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Editorial Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
              <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-400">Seasonal Favorites</span>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-serif text-zinc-900 dark:text-white leading-[0.8] tracking-tighter">
              Daily <br /> 
              <span className="italic font-serif text-zinc-400 dark:text-zinc-600">Essentials</span>
            </h2>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-10">
            {/* Custom Minimalist Pagination */}
            <div className="flex items-center gap-6">
              <span className="font-mono text-[10px] text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">Scroll to Explore</span>
              <div className="flex gap-1">
                <NavBtn icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => scroll('left')} />
                <NavBtn icon={<ArrowRightIcon className="w-4 h-4" />} onClick={() => scroll('right')} />
              </div>
            </div>

            <Link href="/bookecommerce/products" className="group relative py-2 overflow-hidden">
               <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-900 dark:text-white flex items-center gap-3">
                 View All Archive <PlusIcon className="w-3 h-3 transition-transform group-hover:rotate-90" />
               </span>
               <div className="absolute bottom-0 left-0 w-full h-[1px] bg-zinc-900 dark:bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          </div>
        </div>

        {/* Film-Strip Product Scroller */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide space-x-12 pb-12 -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth items-stretch"
          >
            {data.data.map((product: any, idx: number) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[320px] md:w-[380px]"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
            
            {/* Minimalist Catalog Card */}
            <motion.div 
              whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
              className="flex-shrink-0 w-[300px] border border-zinc-100 dark:border-zinc-900 flex flex-col items-center justify-center p-12 text-center group"
            >
              <div className="w-14 h-14 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center mb-8 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900 transition-all duration-500">
                <ShoppingBagIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif italic text-zinc-900 dark:text-white mb-2">Curated Collection</h3>
              <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-8">8+ Premium Items</p>
              
              <Link 
                href="/products" 
                className="font-mono text-[9px] uppercase tracking-widest px-6 py-3 border border-zinc-900 dark:border-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all"
              >
                Enter Shop
              </Link>
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
      className="w-12 h-12 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-900 dark:hover:border-white transition-all active:scale-95"
    >
      {icon}
    </button>
  );
}