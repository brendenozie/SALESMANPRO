'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import Slider from 'react-slick';
import { motion } from 'framer-motion';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const CustomArrow = ({ onClick, direction }: { onClick?: () => void; direction: 'left' | 'right' }) => (
  <button
    onClick={onClick}
    className={`absolute top-1/2 -translate-y-1/2 z-20 h-12 w-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-xl border border-gray-100 text-gray-900 transition-all hover:bg-white hover:scale-110 active:scale-95 ${
      direction === 'left' ? '-left-6' : '-right-6'
    } hidden lg:flex`}
  >
    {direction === 'left' ? <ChevronLeftIcon className="w-6 h-6" /> : <ChevronRightIcon className="w-6 h-6" />}
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
    dots: true,
    infinite: false,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1.2, centerMode: true, arrows: false } }
    ]
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-6 py-20"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-24 bg-white overflow-visible">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-green-600 font-bold tracking-widest uppercase text-xs"
            >
              <SparklesIcon className="w-4 h-4" />
              Don't Miss Out
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Weekly <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">Best Sellers</span>
            </h2>
          </div>
          
          <button 
            onClick={() => window.location.href = `/ecommerce/products`}
            className="group flex items-center gap-2 font-bold text-gray-900 hover:text-green-600 transition-colors"
          >
            Explore All 
            <div className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all">
              <ArrowRightIcon className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative product-slider-container">
          <Slider {...settings}>
            {data.data.map((product: any) => (
              <div key={product.id} className="px-3 pb-12">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <style jsx global>{`
        .product-slider-container .slick-dots { bottom: -20px; }
        .product-slider-container .slick-dots li button:before { font-size: 10px; color: #d1d5db; opacity: 1; }
        .product-slider-container .slick-dots li.slick-active button:before { color: #16a34a; }
      `}</style>
    </section>
  );
}