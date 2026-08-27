'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { 
  ArrowRightIcon, 
  TagIcon, 
  BoltIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { motion } from 'framer-motion';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function DailyBestSells({ id }: { id: string }) {
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const cacheKey = `products-${id}-isOnOffer`;
  const fallbackKey = `swr-cache:${cacheKey}:${url}`;

  const fetcher = createCachedFetcher(cacheKey);

  const fallbackData = typeof window !== 'undefined'
    ? (() => {
        try { return JSON.parse(localStorage.getItem(fallbackKey) || 'null'); } 
        catch { return null; }
      })()
    : null;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    fallbackData: fallbackData || undefined,
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-6 py-24">
       <div className="flex justify-between items-end mb-12">
          <div className="space-y-4">
            <div className="h-6 w-32 bg-stone-100 dark:bg-stone-800 rounded-full animate-pulse" />
            <div className="h-12 w-64 bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse" />
          </div>
       </div>
       <SkeletonGrid count={4} />
    </div>
  );
  
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-24 bg-stone-50/50 dark:bg-[#080808] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-red-600 mb-4"
            >
              <BoltIcon className="w-5 h-5 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Flash Price Drops</span>
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl font-black text-stone-900 dark:text-white tracking-tighter leading-[0.85]">
              Daily <br />
              <span className="text-red-600 italic font-serif font-light underline decoration-stone-200 dark:decoration-stone-800 underline-offset-8">Best Sells.</span>
            </h2>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6">
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-stone-900 bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover grayscale" />
                  </div>
                ))}
                <div className="h-10 px-4 flex items-center justify-center rounded-full bg-stone-900 text-white text-[10px] font-bold border-4 border-white dark:border-stone-900">
                  +42 buying now
                </div>
             </div>
             
             <Link 
              href={`/meatecommerce/products?companyId=${id}&flag=isOnOffer`}
              className="group flex items-center gap-3 px-8 py-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-sm font-black uppercase tracking-widest text-stone-900 dark:text-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
            >
              See All Offers
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>

        {/* --- Responsive Display Logic --- */}

        {/* 1. Mobile/Tablet: Horizontal Scroll with 'Peek' */}
        <div className="md:hidden -mx-6 px-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory flex gap-6 pb-12">
          {data.data.map((product: any) => (
            <div key={product.id} className="min-w-[85%] snap-center">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* 2. Desktop: Sophisticated Staggered Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.data.map((product: any, idx: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={idx === 0 || idx === 1 ? 'lg:scale-105' : ''} // Subtle emphasis on first two
            >
              <div className="relative group">
                {/* Sale Indicator */}
                <div className="absolute -top-4 -left-4 z-20 bg-stone-950 text-white p-3 rounded-2xl shadow-2xl rotate-[-10deg] group-hover:rotate-0 transition-transform">
                  <TagIcon className="w-5 h-5" />
                </div>
                
                <ProductCard product={product} />
              </div>
            </motion.div>
          ))}
          
          {/* Join Membership Bento Card (Slot 8 if limit is met) */}
          {data.data.length >= 7 && (
            <motion.div 
              whileHover={{ y: -5 }}
              className="hidden lg:flex flex-col justify-between p-10 rounded-[3rem] bg-stone-100 dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700"
            >
              <div>
                <SparklesIcon className="w-10 h-10 text-red-600 mb-6" />
                <h4 className="text-2xl font-black text-stone-900 dark:text-white leading-tight mb-4">Get the Butcher's <br/> Private List.</h4>
                <p className="text-stone-500 text-sm leading-relaxed font-medium">Be the first to know about custom cuts and wholesale drops.</p>
              </div>
              <button className="w-full py-4 bg-stone-950 dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest">
                Sign Me Up
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}