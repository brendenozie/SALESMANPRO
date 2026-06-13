'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ArrowRightCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; // Added Chevron icons
import { createCachedFetcher } from '@/lib/swrCachedFetcher';

// Import Slick components and styles
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css'; 
// Note: You might need to adjust the paths/import for slick.css/slick-theme.css 
// based on your project's CSS setup if the imports above don't work globally.

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Custom Arrow Components for Slick ---
// We'll use these to style the navigation arrows with Heroicons and Tailwind
const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button 
    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-lg border border-gray-200 hidden sm:block md:hidden"
    onClick={onClick}
    aria-label="Previous"
  >
    <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
  </button>
);

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button 
    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-lg border border-gray-200 hidden sm:block md:hidden"
    onClick={onClick}
    aria-label="Next"
  >
    <ChevronRightIcon className="w-6 h-6 text-gray-700" />
  </button>
);


export default function DailyBestSells({ id }: { id: string }) {
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

  // --- React Slick Configuration ---
  const settings = {
    // Show one card at a time on small screens
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true, // Show arrows for navigation
    dots: true, // Show pagination dots
    infinite: false, // Don't loop the products
    // Custom arrows are only shown on small screens (md:hidden)
    nextArrow: <NextArrow />, 
    prevArrow: <PrevArrow />,
    // Responsive settings to switch to grid on desktop
    responsive: [
      {
        breakpoint: 768, // md breakpoint in Tailwind
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640, // sm breakpoint in Tailwind
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          // Added centerPadding and centerMode for a 'peek' effect on very small screens
          centerMode: true,
          centerPadding: '20px', 
        }
      }
    ]
  };

  if (isLoading) <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>;
  if (error) return <div className="text-center text-gray-500"></div>;
  if (!data?.data?.length)
    return <div className="text-center text-gray-500"></div>;

  return (
    <section className="py-8 sm:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Popular Products</h2>
          <button 
          onClick={() => window.location.href = `/peanutecommerce/products?companyId=${id}&flag=isOnOffer`}
          className="flex items-center text-green-600 font-semibold text-sm sm:text-base hover:underline transition duration-150 ease-in-out">
            See All <ArrowRightCircleIcon className="w-5 h-5 ml-1 sm:w-6 sm:h-6 sm:ml-2" />
          </button>
        </div>

        {/* --- Responsive Product Display --- */}
        
        {/* 1. Mobile Carousel (Visible below md) */}
        <div className="md:hidden relative px-4"> 
          <Slider {...settings}>
            {data.data.map((product: any) => (
              <div key={product.id} className="px-1 outline-none">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>

        {/* 2. Desktop Grid (Visible at md and above) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.data.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}