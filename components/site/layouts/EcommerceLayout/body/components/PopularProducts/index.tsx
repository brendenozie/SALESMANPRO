'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '@/components/site/SkeletonGrid/SkeletonGrid';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';

export default function PopularProducts({ id }: { id: string }) {
  const url = `/api/site/productsByFlag?id=${id}&flag=isFeatured&limit=8`;
  const fetcher = createCachedFetcher(`products-${id}-isFeatured`);

  const fallbackData = typeof window !== 'undefined' ? (() => {
          try {
            return JSON.parse(
              localStorage.getItem(`swr-cache:products-${id}-isFeatured:${url}`) || 'null'
            );
          } catch {
            return null;
          }
        })()
      : null;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true, // Background refresh on tab focus
    dedupingInterval: 30000, // Prevent duplicate calls within 30s
    refreshInterval: 120000, // Revalidate every 2 minutes
    fallbackData: fallbackData || undefined,
  });

  if (isLoading) return <SkeletonGrid count={8} />;
  if (error) return <div className="text-center text-gray-500"></div>;
  if (!data?.data?.length) return <div className="text-center text-gray-500"></div>;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Popular Products</h2>
          <button className="flex items-center text-green-600 font-semibold hover:underline">
            See All <ArrowRightCircleIcon className="w-6 h-6 ml-2" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.data.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
