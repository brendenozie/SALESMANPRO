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
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function TrendingProducts({ id }: { id: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { storeFormData } = useStoreContext();
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0D9488';

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

  if (isLoading) return <div className="max-w-[1600px] mx-auto px-10 py-32"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="relative py-32 bg-[#FDFDFB] dark:bg-zinc-950 transition-colors duration-500 overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          <div className="max-w-3xl space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-full">
                <SparklesIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.6em] text-zinc-400">
                The Current Collection
              </span>
            </motion.div>
            
            <h2 className="text-7xl md:text-9xl font-serif text-zinc-900 dark:text-white leading-[0.75] tracking-tighter">
              Trending <br /> 
              <span className="italic text-zinc-400 dark:text-zinc-600 font-serif">Aesthetics</span>
            </h2>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-8">
            <div className="flex gap-2">
              <NavBtn icon={<ArrowLeftIcon className="w-5 h-5" />} onClick={() => scroll('left')} />
              <NavBtn icon={<ArrowRightIcon className="w-5 h-5" />} onClick={() => scroll('right')} />
            </div>
            
            <Link 
              href="/bookecommerce/products" 
              className="group flex items-center gap-8 py-4 px-2 border-b-2 border-zinc-900 dark:border-white transition-all hover:pr-8"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-900 dark:text-white">Full Catalog</span>
              <PlusIcon className="w-4 h-4 transition-transform group-hover:rotate-90" />
            </Link>
          </div>
        </div>

        {/* Cinematic Filmstrip */}
        <div className="relative group/carousel">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide space-x-12 pb-16 -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth items-stretch"
          >
            {data.data.map((product: any, idx: number) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[340px] md:w-[420px]"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
            
            {/* The "End of Roll" Card */}
            <motion.div 
              className="flex-shrink-0 w-[300px] border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col items-center justify-center p-12 text-center group relative overflow-hidden"
            >
              <div className="relative z-10 space-y-8">
                <div className="text-zinc-300 dark:text-zinc-700 font-mono text-6xl">/08</div>
                <h3 className="text-3xl font-serif italic text-zinc-900 dark:text-white">View the Archive</h3>
                <Link href="/bookecommerce/products" className="inline-block py-3 px-8 border border-zinc-900 dark:border-white font-mono text-[9px] uppercase tracking-widest hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                  Browse All
                </Link>
              </div>
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
      className="w-16 h-16 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-900 dark:hover:border-white transition-all"
    >
      {icon}
    </button>
  );
}