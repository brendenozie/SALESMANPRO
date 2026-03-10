'use client';

import React from 'react';
import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { 
  ArrowRightIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  FireIcon 
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';
import Slider from 'react-slick';

// Styles for Slick
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button 
    className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-zinc-900 p-3 rounded-full shadow-xl border border-gray-100 dark:border-zinc-800"
    onClick={onClick}
  >
    <ChevronLeftIcon className="w-5 h-5 text-gray-900 dark:text-white" />
  </button>
);

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button 
    className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-zinc-900 p-3 rounded-full shadow-xl border border-gray-100 dark:border-zinc-800"
    onClick={onClick}
  >
    <ChevronRightIcon className="w-5 h-5 text-gray-900 dark:text-white" />
  </button>
);

export default function DailyBestSells({ id }: { id: string }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#ef4444';

  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const cacheKey = `products-${id}-isOnOffer`;
  const fetcher = createCachedFetcher(cacheKey);

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  const settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    infinite: false,
    nextArrow: <NextArrow />, 
    prevArrow: <PrevArrow />,
    centerMode: true,
    centerPadding: '30px',
  };

  if (isLoading) return <div className="py-20"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FireIcon className="w-5 h-5" style={{ color: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
                High Demand
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter dark:text-white">
              Popular <span className="text-transparent stroke-zinc-900 dark:stroke-white stroke-1" style={{ WebkitTextStroke: `1px ${primaryColor}` }}>Sells</span>
            </h2>
          </div>
          
          <button 
            onClick={() => window.location.href = `/fashionecommerce/products`}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] dark:text-white"
          >
            Explore the vault 
            <div className="p-2 rounded-full border border-gray-200 dark:border-zinc-800 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
              <ArrowRightIcon className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Mobile View: High Impact Slider */}
        <div className="md:hidden relative"> 
          <Slider {...settings}>
            {data.data.map((product: any) => (
              <div key={product.id} className="px-2 outline-none">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>

        {/* Desktop View: Precision Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.data.map((product: any, idx: number) => (
            <div 
              key={product.id}
              className={`${idx % 2 !== 0 ? 'md:translate-y-12' : ''} transition-transform duration-700`}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}