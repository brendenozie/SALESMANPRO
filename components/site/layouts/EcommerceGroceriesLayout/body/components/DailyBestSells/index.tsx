'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import { 
  ArrowRightIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  BoltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Sophisticated Custom Arrows ---
const SlickArrow = ({ direction, onClick }: { direction: 'left' | 'right', onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`absolute -top-16 ${direction === 'left' ? 'right-16' : 'right-0'} z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition-all hover:bg-black hover:text-white hover:border-black shadow-sm`}
  >
    {direction === 'left' ? <ChevronLeftIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
  </button>
);

export default function DailyBestSells({ id }: { id: string }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const cacheKey = `products-${id}-isOnOffer`;
  const fetcher = createCachedFetcher(cacheKey);

  const { data, isLoading, error } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  const sliderSettings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: false,
    nextArrow: <SlickArrow direction="right" />,
    prevArrow: <SlickArrow direction="left" />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1.2, arrows: false, centerMode: true } }
    ]
  };

  if (isLoading) return <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Visual Accent - Soft glow behind the section */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Logic */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-gray-100 pb-8 relative">
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                <BoltIcon className="h-4 w-4 text-amber-600" />
              </span>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">Exclusive Deals</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Daily Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">Sellers</span>
            </h2>
          </div>

          <motion.button 
            whileHover={{ x: 5 }}
            onClick={() => window.location.href = `/groceriesecommerce/products`}
            className="mt-6 md:mt-0 group flex items-center gap-2 text-lg font-bold text-gray-900"
          >
            See All Offers
            <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Featured Promo Card - Stays static on desktop to anchor the section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="hidden xl:flex flex-col justify-between p-10 rounded-[2.5rem] bg-gray-900 text-white relative overflow-hidden group shadow-2xl"
          >
            <div className="relative z-10">
              <SparklesIcon className="w-12 h-12 text-green-400 mb-6" />
              <h3 className="text-3xl font-black mb-4 leading-tight">Bring nature into your home.</h3>
              <p className="text-gray-400 font-medium">Get up to <span className="text-white font-bold">40% OFF</span> on fresh organic harvests today.</p>
            </div>
            
            <button 
              onClick={() => window.location.href = `/groceriesecommerce/products`}
              className="relative z-10 mt-8 w-full py-4 bg-green-600 rounded-2xl font-bold hover:bg-green-500 transition-colors shadow-lg shadow-green-900/20"
              style={{ backgroundColor: primary }}
            >
              Shop Collection
            </button>

            {/* Background Decorative Graphic */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
          </motion.div>

          {/* Slider for the rest of the products */}
          <div className="xl:col-span-3 slider-container-v6">
            <Slider {...sliderSettings}>
              {data.data.map((product: any) => (
                <div key={product.id} className="px-3 pb-8">
                  <ProductCard product={product} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .slider-container-v6 .slick-list { overflow: visible; }
        .slider-container-v6 .slick-dots { bottom: -40px; }
        .slider-container-v6 .slick-dots li button:before { font-size: 8px; color: #e5e7eb; opacity: 1; }
        .slider-container-v6 .slick-dots li.slick-active button:before { color: #10b981; }
      `}</style>
    </section>
  );
}