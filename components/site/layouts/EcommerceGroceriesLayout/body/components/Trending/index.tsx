'use client';

import React, { useRef } from 'react';
import useSWR from 'swr';
import { motion, useInView } from 'framer-motion';
import { 
  FireIcon, 
  ArrowUpRightIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from '@heroicons/react/24/solid';
import Slider from 'react-slick';

import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const CustomArrow = ({ onClick, direction }: { onClick?: () => void; direction: 'left' | 'right' }) => (
  <button
    onClick={onClick}
    className={`absolute top-1/2 -translate-y-1/2 z-20 h-14 w-14 flex items-center justify-center rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl border border-gray-100 text-gray-900 transition-all hover:bg-black hover:text-white group ${
      direction === 'left' ? '-left-7' : '-right-7'
    } hidden xl:flex`}
  >
    {direction === 'left' ? (
      <ChevronLeftIcon className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
    ) : (
      <ChevronRightIcon className="w-6 h-6 transition-transform group-hover:translate-x-1" />
    )}
  </button>
);

export default function TrendingProducts({ id }: { id: string }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=trending&limit=10`;
  const cacheKey = `products-${id}-trending`;
  const fetcher = createCachedFetcher(cacheKey);

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2, arrows: false } },
      { breakpoint: 640, settings: { slidesToShow: 1.1, centerMode: true, arrows: false, dots: false } }
    ]
  };

  if (isLoading) return <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section ref={containerRef} className="relative py-24 bg-white overflow-hidden">
      {/* Decorative Gradient Blob */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-50 rounded-full blur-[120px] opacity-60 -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header Logic */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-100 text-orange-600 font-bold text-xs uppercase tracking-[0.2em]"
            >
              <FireIcon className="w-4 h-4" />
              Hot Right Now
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-none"
            >
              Trending <span className="italic font-light text-gray-400">Essentials</span>
            </motion.h2>
          </div>

          <motion.button 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            onClick={() => window.location.href = `/groceriesecommerce/products`}
            className="group flex items-center gap-4 bg-gray-900 text-white pl-8 pr-2 py-2 rounded-[2rem] hover:bg-orange-600 transition-all duration-500 shadow-xl hover:shadow-orange-200"
          >
            <span className="font-bold tracking-tight">Discover Full Collection</span>
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
              <ArrowUpRightIcon className="w-5 h-5" />
            </div>
          </motion.button>
        </div>

        {/* The Carousel Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="trending-slider-wrapper relative"
        >
          <Slider {...settings}>
            {data.data.map((product: any, idx: number) => (
              <div key={product.id} className="px-3 pb-16 outline-none">
                {/* We use a slight staggered scale for the first view */}
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              </div>
            ))}
          </Slider>
        </motion.div>
      </div>

      {/* Custom Styles for Slick dots & layout */}
      <style jsx global>{`
        .trending-slider-wrapper .slick-list { overflow: visible; }
        .trending-slider-wrapper .slick-dots { bottom: 0px; text-align: left; left: 12px; }
        .trending-slider-wrapper .slick-dots li { margin: 0 4px; }
        .trending-slider-wrapper .slick-dots li button:before { 
          content: ''; 
          width: 12px; 
          height: 4px; 
          background: #e5e7eb; 
          border-radius: 2px; 
          opacity: 1; 
          transition: all 0.3s;
        }
        .trending-slider-wrapper .slick-dots li.slick-active button:before { 
          width: 32px; 
          background: #f97316; 
        }
      `}</style>
    </section>
  );
}