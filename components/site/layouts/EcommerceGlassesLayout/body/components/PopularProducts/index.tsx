'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function DailyBestSells({ id }: { id: string }) {
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const fetcher = createCachedFetcher(`products-${id}-isOnOffer`);

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  if (isLoading) return <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-24 bg-white border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-6 bg-[#F3A852]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F3A852]">Selected for you</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 leading-none">
              Featured <span className="italic font-light">Artifacts</span>
            </h2>
          </div>
          
          <button 
            onClick={() => window.location.href = `/glassesecommerce/products`}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-200 pb-1 hover:border-[#F3A852] transition-all"
          >
            Explore all items <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* Clean Desktop/Mobile Grid (No Slick required for better UX) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {data.data.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}