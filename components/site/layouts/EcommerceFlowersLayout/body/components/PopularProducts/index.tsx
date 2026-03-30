"use client";

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { motion } from 'framer-motion';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function DailyBestSells({ id }: { id: string }) {
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const cacheKey = `products-${id}-isOnOffer`;
  const fetcher = createCachedFetcher(cacheKey);

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  if (isLoading) return <div className="max-w-7xl mx-auto px-6 py-20"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-24 bg-[#FCFBFA]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-rose-500 text-[11px] uppercase tracking-[0.4em] font-bold mb-4 block"
            >
              Seasonal Picks
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-serif italic text-slate-900"
            >
              The Daily <span className="text-slate-400">Harvest</span>
            </motion.h2>
          </div>
          
          <motion.button 
            whileHover={{ x: 5 }}
            onClick={() => window.location.href = `/flowersecommerce/products`}
            className="flex items-center gap-3 text-slate-900 font-bold uppercase tracking-[0.2em] text-[12px] border-b border-slate-200 pb-2 self-start md:self-auto"
          >
            Explore All Stems <ArrowRightIcon className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Clean Grid - No Carousel for Desktop/Tablet to maintain premium feel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {data.data.map((product: any, idx: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}