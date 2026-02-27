'use client';

import React, { useRef } from 'react';
import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { motion } from 'framer-motion';

// Import Slick components
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css'; 

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function DailyBestSells({ id }: { id: string }) {
  const sliderRef = useRef<Slider | null>(null);
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
    arrows: false,
    dots: true,
    infinite: true,
    speed: 500,
    centerMode: true,
    centerPadding: '30px',
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, centerPadding: '40px' }
      }
    ]
  };

  if (isLoading) return <div className="py-20"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-24 bg-[#FCFAF7] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="absolute -top-8 -left-6 text-amber-500/20"
            >
              <SparklesIcon className="w-12 h-12" />
            </motion.div>
            
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-amber-600 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs mb-3 block"
            >
              Fresh From The Oven
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900 leading-none"
            >
              Daily <span className="italic font-serif font-light text-amber-700">Best Sells</span>
            </motion.h2>
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => (window.location.href = '/ecommerce/products')}
              className="mr-4 text-xs font-black uppercase tracking-widest border-b-2 border-amber-500 pb-1 hover:text-amber-600 transition-all"
            >
              View All
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => sliderRef.current?.slickPrev()}
                className="p-3 rounded-full border border-gray-200 hover:bg-white hover:shadow-lg transition-all"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-900" />
              </button>
              <button 
                onClick={() => sliderRef.current?.slickNext()}
                className="p-3 rounded-full border border-gray-200 hover:bg-white hover:shadow-lg transition-all"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-900" />
              </button>
            </div>
          </div>
        </div>

        {/* --- Product Display --- */}
        
        {/* Mobile/Tablet Slider */}
        <div className="md:hidden relative pb-12"> 
          <Slider ref={sliderRef} {...settings}>
            {data.data.map((product: any) => (
              <div key={product.id} className="px-2 outline-none">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>

        {/* Desktop Grid (Static for cleaner UI) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {data.data.map((product: any, idx: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Aesthetic Flourish: Background Text */}
      <div className="absolute left-0 bottom-0 pointer-events-none opacity-[0.03] select-none translate-y-1/2">
        <h2 className="text-[20vw] font-black uppercase leading-none">Artisan</h2>
      </div>
    </section>
  );
}