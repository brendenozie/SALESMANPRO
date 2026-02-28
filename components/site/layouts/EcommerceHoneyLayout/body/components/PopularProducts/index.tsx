'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';

export default function DailyBestSells({ id }: { id: string }) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const { data, isLoading, error } = useSWR(url, createCachedFetcher(`products-${id}-isOnOffer`));

  if (isLoading) return <SkeletonGrid count={4} />;
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-24 bg-[#FCFAF7]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <span className="text-[#B8860B] font-black text-[10px] uppercase tracking-[0.4em] block mb-4">
              Seasonal Recommendations
            </span>
            <h2 className="text-4xl md:text-5xl font-serif italic text-[#3E2723]">
              The Collector&apos;s <span className="text-[#F3A852]">Selection</span>
            </h2>
          </div>
          
          <button 
            onClick={() => window.location.href = `/ecommerce/products`}
            className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#3E2723]"
          >
            <span className="border-b-2 border-[#3E2723] pb-1 group-hover:text-[#F3A852] group-hover:border-[#F3A852] transition-all">
              View All Products
            </span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Product Grid - No Slider for Desktop for better UX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.data.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}