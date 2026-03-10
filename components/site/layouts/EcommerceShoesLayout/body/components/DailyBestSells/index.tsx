'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ChevronLeftIcon, ChevronRightIcon, FireIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import Slider from 'react-slick';

// Slick styles (Should be in your global CSS ideally, but here for reference)
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// --- STYLED ARROWS ---
const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    className="absolute -left-2 sm:left-2 top-1/2 -translate-y-1/2 z-20 
               bg-white dark:bg-slate-800 p-3 rounded-full shadow-xl 
               border border-gray-100 dark:border-slate-700 
               hover:scale-110 active:scale-95 transition-all group"
    onClick={onClick}
    aria-label="Previous"
  >
    <ChevronLeftIcon className="w-5 h-5 text-gray-900 dark:text-white group-hover:text-red-500 transition-colors" />
  </button>
);

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    className="absolute -right-2 sm:right-2 top-1/2 -translate-y-1/2 z-20 
               bg-white dark:bg-slate-800 p-3 rounded-full shadow-xl 
               border border-gray-100 dark:border-slate-700 
               hover:scale-110 active:scale-95 transition-all group"
    onClick={onClick}
    aria-label="Next"
  >
    <ChevronRightIcon className="w-5 h-5 text-gray-900 dark:text-white group-hover:text-red-500 transition-colors" />
  </button>
);

export default function DailyBestSells({ id }: { id: string }) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
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
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    customPaging: () => (
      <div className="w-2 h-2 mx-1 mt-8 rounded-full bg-gray-300 dark:bg-slate-700 hover:bg-red-500 transition-colors" />
    ),
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, centerMode: true, centerPadding: '40px' },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1, centerMode: true, centerPadding: '20px' },
      },
    ],
  };

  if (isLoading) return <div className="py-20 bg-gray-50 dark:bg-slate-950"><SkeletonGrid count={8} /></div>;
  if (error || !data?.data?.length) return null;

  const products = data.data;

  return (
    <section className="py-16 sm:py-24 bg-gray-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-500 dark:text-red-400 font-black uppercase tracking-[0.2em] text-xs">
              <FireIcon className="w-4 h-4" />
              Limited Time Offers
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter">
              Daily <span className="text-transparent" style={{ WebkitTextStroke: '1px currentColor' }}>Best Sells</span>
            </h2>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-sm font-bold text-gray-400">
            <span className="text-gray-900 dark:text-white underline underline-offset-8 decoration-red-500">Featured</span>
            <span className="hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition-colors">Popular</span>
            <span className="hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition-colors">New Arrival</span>
          </div>
        </div>

        {/* MOBILE CAROUSEL */}
        <div className="md:hidden relative pb-12">
          <Slider {...settings}>
            {products.map((product: any) => (
              <div key={product._id} className="px-2 outline-none">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>

        {/* DESKTOP GRID */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        
      </div>
    </section>
  );
}