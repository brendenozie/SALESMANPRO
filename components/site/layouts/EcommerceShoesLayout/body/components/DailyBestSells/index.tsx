'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '@/components/site/SkeletonGrid/SkeletonGrid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// --- ARROWS ---
const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    className="
      absolute left-0 top-1/2 -translate-y-1/2 z-10 
      bg-white p-2 rounded-full shadow-lg border border-gray-200
      hidden sm:block md:hidden
    "
    onClick={onClick}
    aria-label="Previous"
  >
    <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
  </button>
);

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    className="
      absolute right-0 top-1/2 -translate-y-1/2 z-10 
      bg-white p-2 rounded-full shadow-lg border border-gray-200
      hidden sm:block md:hidden
    "
    onClick={onClick}
    aria-label="Next"
  >
    <ChevronRightIcon className="w-6 h-6 text-gray-700" />
  </button>
);

export default function DailyBestSells({ id }: { id: string }) {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const cacheKey = `products-${id}-isOnOffer`;
  const fallbackKey = `swr-cache:${cacheKey}:${url}`;

  const fetcher = createCachedFetcher(cacheKey);

  const fallbackData =
    typeof window !== 'undefined'
      ? (() => {
          try {
            return JSON.parse(localStorage.getItem(fallbackKey) || 'null');
          } catch {
            return null;
          }
        })()
      : null;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    fallbackData: fallbackData || undefined,
    revalidateOnFocus: true,
    dedupingInterval: 30000,
    refreshInterval: 120000,
  });

  // --- Slick Settings ---
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
        breakpoint: 768, // md
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640, // sm
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '20px',
        },
      },
    ],
  };

  if (isLoading) return <SkeletonGrid count={8} />;
  if (error) return <div className="text-center text-gray-500">Error loading products.</div>;

  const products = data?.data || [];
  if (!products.length)
    return <div className="text-center text-gray-500">No daily best sells found.</div>;

  return (
    <section className="py-8 sm:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Daily Best Sells
          </h2>
        </div>

        {/* MOBILE CAROUSEL */}
        <div className="md:hidden overflow-hidden relative">
          <Slider {...settings}>
            {products.map((product: any) => (
              <div key={product._id} className="px-2">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>

        {/* DESKTOP GRID */}
        <div className="hidden md:grid grid-cols-4 gap-6 mt-6">
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
