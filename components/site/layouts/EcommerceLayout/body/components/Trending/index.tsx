'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ArrowRightCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import Slider from 'react-slick';

// Standard Slick styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button 
    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hidden sm:block md:hidden"
    onClick={onClick}
    aria-label="Previous"
  >
    <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
  </button>
);

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button 
    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hidden sm:block md:hidden"
    onClick={onClick}
    aria-label="Next"
  >
    <ChevronRightIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
  </button>
);

export default function DailyBestSells({ id }: { id: string }) {
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
    infinite: false,
    nextArrow: <NextArrow />, 
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, slidesToScroll: 1 }
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1, slidesToScroll: 1, centerMode: true, centerPadding: '20px' }
      }
    ]
  };

  if (isLoading) return <SkeletonGrid count={8} />;
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-8 sm:py-12 bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Trending <span className="text-indigo-600 dark:text-indigo-400">Products</span> 
          </h2>
          <button 
            onClick={() => window.location.href = `/ecommerce/products`}
            className="flex items-center text-gray-600 dark:text-gray-400 font-bold text-sm sm:text-base hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Explore All <ArrowRightCircleIcon className="w-5 h-5 ml-1.5" />
          </button>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative px-2"> 
          <Slider {...settings}>
            {data.data.map((product: any) => (
              <div key={product.id} className="px-2 outline-none pb-8">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.data.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}