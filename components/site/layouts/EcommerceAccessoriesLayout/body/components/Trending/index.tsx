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
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function AutomotiveTrendingCarousel({ id }: { id: string }) {
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

  if (isLoading) return <div className="py-20 bg-zinc-50 dark:bg-[#060606] border-y border-zinc-100 dark:border-zinc-900"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section 
      style={{ '--primary-color': primaryColor } as React.CSSProperties}
      className="relative py-24 bg-white dark:bg-[#060606] border-y border-zinc-100 dark:border-zinc-900 transition-colors duration-500 overflow-hidden"
    >
      {/* High-Performance Engineered Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: Performance Dashboard Layout */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8 relative group">
          {/* Header decorative accent line */}
          <div className="absolute -bottom-6 left-0 w-32 h-1 bg-[var(--primary-color)] transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700 z-10" />
          
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3.5 px-3.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-sm group"
            >
              <BoltIcon className="w-4 h-4 text-[var(--primary-color)] animate-pulse" />
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-zinc-600 dark:text-zinc-400">Core Status: High Performance</span>
            </motion.div>
            
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-zinc-950 dark:text-white leading-[0.85] tracking-tighter uppercase relative group">
              Systems <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, transparent)`, WebkitTextStroke: `1px ${primaryColor}` }}>Core Series</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-1">
              <NavBtn icon={<ChevronLeftIcon className="w-6 h-6" />} onClick={() => scroll('left')} />
              <NavBtn icon={<ChevronRightIcon className="w-6 h-6" />} onClick={() => scroll('right')} />
            </div>
            
            <Link href="/automotiveecommerce/products" className="group relative h-16 flex items-center gap-4 px-10 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black transition-all shadow-md active:scale-95 rounded-sm overflow-hidden">
              {/* Dynamic hover trail pattern */}
              <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '10px 100%' }} />
              
              <div className="absolute inset-0 bg-[var(--primary-color)] transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 z-0" />
              <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em] group-hover:text-zinc-950 transition-colors">Catalog Dispatch</span>
              <ArrowRightIcon className="relative z-10 w-4 h-4 group-hover:translate-x-2 transition-transform group-hover:text-zinc-950" />
            </Link>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide space-x-6 pb-12 -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth items-stretch snap-x snap-mandatory"
          >
            {data.data.map((product: any, idx: number) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[310px] md:w-[380px] snap-start md:snap-align-none"
              >
                <div className="h-full border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-sm hover:border-[var(--primary-color)] group hover:shadow-xl hover:shadow-[var(--primary-color)]/10 transition-all rounded-sm overflow-hidden relative">
                    {/* Added precise mechanical detail */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary-color)] transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 z-20" />
                    <ProductCard product={product} />
                </div>
              </motion.div>
            ))}
            
            {/* The central OEM Access/Schematic Dispatch Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex-shrink-0 w-[280px] relative bg-white dark:bg-zinc-950 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-12 text-center group overflow-hidden rounded-sm cursor-pointer shadow-lg hover:border-[var(--primary-color)]/50 transition-colors snap-start md:snap-align-none"
            >
              {/* Background pattern details */}
              <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(currentColor 0.5px, transparent 0.5px), linear-gradient(90deg, currentColor 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
              
              {/* Refined Rivet detail motifs */}
              <div className="absolute top-4 left-4 w-1 h-1 rounded-full bg-current opacity-30" />
              <div className="absolute top-4 right-4 w-1 h-1 rounded-full bg-current opacity-30" />
              <div className="absolute bottom-4 left-4 w-1 h-1 rounded-full bg-current opacity-30" />
              <div className="absolute bottom-4 right-4 w-1 h-1 rounded-full bg-current opacity-30" />
              
              {/* Circuit animation schematic details on hover */}
              <div className="absolute -bottom-16 -right-16 w-32 h-32 opacity-[0.05] dark:opacity-[0.03] group-hover:opacity-[0.1] transition-opacity" style={{ backgroundImage: 'radial-gradient(currentColor 1.5px, transparent 1.5px)', backgroundSize: '15px 15px' }} />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 border border-[var(--primary-color)] flex items-center justify-center mb-8 mx-auto shadow-inner rounded-sm group-hover:bg-[var(--primary-color)] transition-colors duration-500 relative">
                  {/* Internal glow detail */}
                  <div className="absolute inset-2 border-t border-[var(--primary-color)]/50 rounded-sm" />
                    <CpuChipIcon className="w-10 h-10 text-[var(--primary-color)] group-hover:text-zinc-950 transition-colors duration-500" />
                </div>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none group-hover:text-[var(--primary-color)] transition-colors">Dispatch<br/>Systems</h3>
                <p className="mt-4 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em] font-mono">Engineered OEM Series</p>
              </div>
              
              <Link href="/automotiveecommerce/products" className="absolute inset-0" />
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
      className="w-16 h-16 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-950 dark:hover:bg-zinc-100 hover:text-zinc-950 transition-all rounded-sm shadow-md active:scale-95 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-zinc-950 dark:bg-white scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 z-0" />
      <span className="relative z-10 transition-colors duration-500 group-hover:currentColor">{icon}</span>
    </button>
  );
}