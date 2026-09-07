'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { 
  ArrowRightIcon, 
  FireIcon, 
  SparklesIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { motion } from 'framer-motion';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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
    <div className="max-w-7xl mx-auto px-6 py-20">
       <div className="h-10 w-48 bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse mb-10" />
       <SkeletonGrid count={4} />
    </div>
  );
  
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-24 bg-white dark:bg-[#0c0c0c] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Logic */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-red-600 dark:text-red-500"
            >
              <TicketIcon className="w-5 h-5 animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Limited Time Offers</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 dark:text-white tracking-tighter">
              Daily <span className="text-red-600 italic font-serif font-light">Best Sells.</span>
            </h2>
          </div>

          <Link 
            href={`/meatecommerce/products?companyId=${id}&flag=isOnOffer`}
            className="group flex items-center gap-3 px-6 py-3 bg-stone-100 dark:bg-stone-900 rounded-full text-stone-900 dark:text-white font-bold text-sm transition-all hover:bg-red-600 hover:text-white"
          >
            View All Deals 
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* --- Responsive Display Logic --- */}

        {/* 1. Mobile & Tablet: Native Snap Scroll (Smooth & Intuitive) */}
        <div className="md:hidden -mx-6 px-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory flex gap-5 pb-8">
          {data.data.map((product: any) => (
            <div key={product.id} className="min-w-[85%] sm:min-w-[45%] snap-center">
              <ProductCard product={product} />
            </div>
          ))}
          {/* Peek at the end */}
          <div className="min-w-[10%] flex items-center justify-center">
             <Link href={`/meatecommerce/products?companyId=${id}&flag=isOnOffer`} className="p-4 bg-stone-100 dark:bg-stone-900 rounded-full">
                <ArrowRightIcon className="w-6 h-6 text-stone-400" />
             </Link>
          </div>
        </div>

        {/* 2. Desktop: Polished Bento-ish Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.data.map((product: any, idx: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="relative group">
                {/* Decorative Offer Badge for Desktop */}
                <div className="absolute -top-3 -right-3 z-20 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-lg rotate-12 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                  SAVE BIG
                </div>
                <ProductCard product={product} />
              </div>
            </motion.div>
          ))}

          {/* Featured Promo Card (Only if space allows) */}
          {data.data.length < 8 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="lg:col-span-1 hidden lg:flex flex-col justify-center items-center p-8 rounded-[2.5rem] bg-gradient-to-br from-red-600 to-rose-700 text-white text-center"
            >
              <FireIcon className="w-12 h-12 mb-4 opacity-50" />
              <h4 className="text-2xl font-black mb-2">Weekend BBQ?</h4>
              <p className="text-sm text-white/80 mb-6">Check out our family-sized platters on offer.</p>
              <div className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest">
                Save up to 20%
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}