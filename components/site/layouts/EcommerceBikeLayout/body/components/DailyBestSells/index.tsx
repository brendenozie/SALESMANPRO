'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function DailyBestSells({ id }: { id: string }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || "#FF6B00";

  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const cacheKey = `products-${id}-isOnOffer`;
  const fetcher = createCachedFetcher(cacheKey);

  const { data, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  if (isLoading) return <div className="py-20 max-w-7xl mx-auto px-6"><SkeletonGrid count={4} /></div>;
  if (!data?.data?.length) return null;

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header with Racing Aesthetics */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="relative">
            <div className="absolute -top-10 -left-6 text-[120px] font-black text-gray-100 -z-10 select-none">
              01
            </div>
            <span className="inline-block px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest mb-4" style={{ backgroundColor: primary }}>
              Limited Offers
            </span>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-gray-900 leading-[0.8]">
              Daily Best <br /> <span className="text-outline" style={{ WebkitTextStroke: '1px #111', color: 'transparent' }}>Performance</span>
            </h2>
          </div>

          <button 
            onClick={() => window.location.href = `/ecommerce/products`}
            className="group flex items-center gap-4 text-xs font-black tracking-[0.3em] uppercase transition-all hover:gap-6"
          >
            Full Catalog <ArrowRightIcon className="w-5 h-5" style={{ color: primary }} />
          </button>
        </div>

        {/* Grid - Standardized to avoid Slick complexity unless needed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 border border-gray-100 shadow-2xl">
          {data.data.map((product: any) => (
            <div key={product.id} className="bg-white">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}