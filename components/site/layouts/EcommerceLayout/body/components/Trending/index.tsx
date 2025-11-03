'use client';
import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '@/components/site/SkeletonGrid/SkeletonGrid';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Trending({ slug }: { slug: string }) {
  const { data, error, isLoading } = useSWR(
    `/api/site/productsByFlag?slug=${slug}&flag=trending&limit=8`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (isLoading) return <SkeletonGrid count={8} />;
  if (error) return <div className="text-center text-gray-500">Error loading trending items</div>;

  return (
    <section className="py-10">
      <h2 className="text-2xl font-semibold mb-6 px-4">Trending Now</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
        {data?.data?.map((product:any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
