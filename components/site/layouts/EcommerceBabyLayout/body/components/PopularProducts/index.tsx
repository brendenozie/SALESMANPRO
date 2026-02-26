'use client';

import React, { useRef } from 'react';
import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '@/components/site/SkeletonGrid/SkeletonGrid';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function DailyBestSells({ id }: { id: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { storeFormData } = useStoreContext();
  
  // Theme colors from your AxeMart reference
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F472B6'; // Pink
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#3B82F6'; // Blue

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
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-12"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-16 bg-[#F8FBFF]"> {/* Soft blue background from reference */}
      <div className="max-w-7xl mx-auto px-4 sm:px-10">
        
        {/* AxeMart Style Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3"
              style={{ backgroundColor: `${secondaryColor}15`, color: secondaryColor }}
            >
              <SparklesIcon className="w-3 h-3" />
              Don't Miss Out
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Daily <span style={{ color: primaryColor }}>Best Sells</span>
            </h2>
          </div>

          {/* AxeMart Navigation Arrows */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => scroll('left')}
              className="p-3 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all text-gray-400 hover:text-gray-900"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-3 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all text-gray-400 hover:text-gray-900"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide space-x-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth"
        >
          {data.data.map((product: any) => (
            <div 
              key={product.id} 
              className="flex-shrink-0 w-[280px] sm:w-[300px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
          
          {/* "See All" Final Card */}
          <button 
            onClick={() => window.location.href = `/ecommerce/products`}
            className="flex-shrink-0 w-[200px] rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center group hover:border-blue-400 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <ChevronRightIcon className="w-6 h-6" />
            </div>
            <span className="mt-4 font-bold text-gray-500 group-hover:text-blue-600">View All Deals</span>
          </button>
        </div>
      </div>
    </section>
  );
}