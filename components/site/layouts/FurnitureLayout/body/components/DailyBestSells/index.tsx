'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';
import Slider from 'react-slick';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion } from 'framer-motion';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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

  // Tailored specifically for maximum screen real estate on mobile devices
  const settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false, // Prevents unintended viewport scaling/horizontal scrolling
    dots: true,
    infinite: false,
  };

  // Fixed: Added missing return statement to ensure skeleton screen renders correctly
  if (isLoading) {
    return (
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <SkeletonGrid count={8} />
      </div>
    );
  }
  
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-16 md:py-24 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        
        {/* --- Section Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">
                Curated Selection
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
              Daily <span className="font-serif italic font-light text-zinc-400">Best </span>Sells
            </h2>
          </div>

          <button
            onClick={() => { window.location.href = `/furnitureecommerce/products?filter=onOffer`; }}
            className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white hover:opacity-70 transition-all self-start md:self-auto"
          >
            Explore All 
            <span className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-full group-hover:translate-x-1 transition-transform">
              <ArrowRightIcon className="w-4 h-4" />
            </span>
          </button>
        </div>

        {/* --- Carousel: Mobile --- */}
        <div className="md:hidden relative mb-10"> 
          <Slider {...settings} className="product-slider">
            {data.data.map((product: any) => (
              <div key={product.id} className="px-1 outline-none">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>

        {/* --- Grid: Desktop --- */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8">
          {data.data.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* --- Bottom Progress Indicator (Visual only) --- */}
        <div className="mt-20 hidden md:block">
           <div className="h-[1px] w-full bg-zinc-200 dark:bg-zinc-900 relative">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '30%' }}
                className="absolute top-0 left-0 h-[1px]"
                style={{ backgroundColor: primaryColor }}
              />
           </div>
        </div>
      </div>

      <style jsx global>{`
        .product-slider .slick-dots li button:before {
          color: ${primaryColor};
          font-size: 8px;
          opacity: 0.2;
        }
        .product-slider .slick-dots li.slick-active button:before {
          color: ${primaryColor};
          opacity: 1;
        }
        /* Normalizes card card height distributions uniformly across the track layout */
        .product-slider .slick-track {
          display: flex !important;
        }
        .product-slider .slick-slide {
          height: auto !important;
          display: flex !important;
          justify-content: center;
        }
      `}</style>
    </section>
  );
}