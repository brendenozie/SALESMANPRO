'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { 
  ArrowRightIcon, 
  FireIcon, 
  ChartBarIcon,
  HashtagIcon 
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { motion } from 'framer-motion';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function TrendingProducts({ id }: { id: string }) {
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=trending&limit=8`;
  const cacheKey = `products-${id}-trending`;
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
       <SkeletonGrid count={4} />
    </div>
  );
  
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-24 bg-[#fcfcfc] dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 mb-4"
            >
              <FireIcon className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">In High Demand</span>
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl font-black text-stone-900 dark:text-white tracking-tighter leading-[0.85]">
              Trending <br />
              <span className="text-orange-600 italic font-serif font-light">This Week.</span>
            </h2>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4">
            <p className="text-stone-500 font-medium max-w-[280px] md:text-right leading-relaxed">
              Based on recent orders and local butcher recommendations in your area.
            </p>
            <Link 
              href={`/meatecommerce/products?companyId=${id}&flag=trending`}
              className="group flex items-center gap-3 text-sm font-black uppercase tracking-widest text-stone-900 dark:text-white"
            >
              Explore All Trending
              <div className="p-2 rounded-full border border-stone-200 dark:border-stone-800 group-hover:bg-orange-600 group-hover:border-orange-600 group-hover:text-white transition-all">
                <ArrowRightIcon className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Product Grid - We skip the heavy slider for a clean, swipeable flex row on mobile */}
        <div className="relative">
          {/* Mobile Swipe-Hint Overlay (Visible only briefly) */}
          <div className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none animate-pulse">
             <div className="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg">
                <ArrowRightIcon className="w-5 h-5 text-orange-600" />
             </div>
          </div>

          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-12 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
            {data.data.map((product: any, idx: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="min-w-[80vw] sm:min-w-[40vw] md:min-w-0 snap-center"
              >
                <div className="relative group">
                  {/* Trending Badge Overlay */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-sm border border-stone-100 dark:border-stone-800 group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="w-3 h-3 text-orange-600" />
                    <span className="text-[9px] font-black uppercase text-stone-900 dark:text-white">#{idx + 1} Trending</span>
                  </div>
                  
                  <ProductCard product={product} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Card (Appears at the end of trending list) */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-12 p-8 md:p-12 rounded-[3rem] bg-orange-600 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h4 className="text-3xl font-black mb-2 tracking-tight">Don't miss out on the best cuts.</h4>
            <p className="text-orange-100 font-medium">Join 2,000+ chefs and home cooks getting weekly stock alerts.</p>
          </div>
          <button className="relative z-10 px-10 py-4 bg-white text-orange-600 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl">
            Join the Waitlist
          </button>
          
          {/* Decorative background element */}
          <HashtagIcon className="absolute -right-10 -bottom-10 w-64 h-64 text-orange-500 opacity-20 -rotate-12" />
        </motion.div>
      </div>
    </section>
  );
}