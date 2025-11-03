'use client';
import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '@/components/site/SkeletonGrid/SkeletonGrid';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DailyBestSells({ slug }: { slug: string }) {
  const { data, error, isLoading } = useSWR(
    `/api/site/productsByFlag?slug=${slug}&flag=isOnOffer&limit=8`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (isLoading) return <SkeletonGrid count={8} />;
  if (error) return <div className="text-center text-gray-500">Error loading deals</div>;  
  if (data?.data?.length == 0) return  <div className="text-center text-gray-500"></div>;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Daily Best Sells</h2>
          <button className="flex items-center text-green-600 font-semibold hover:underline">
            See All <ArrowRightCircleIcon className="w-6 h-6 ml-2" />
          </button>
        </div>
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data?.data?.map((product:any) => (
              <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
