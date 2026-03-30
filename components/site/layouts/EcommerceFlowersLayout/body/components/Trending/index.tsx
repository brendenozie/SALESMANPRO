"use client";

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import Slider from 'react-slick';
import { motion } from 'framer-motion';

// Import Slick styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button 
    className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-xl border border-slate-100 hover:bg-white transition-all group hidden lg:block"
    onClick={onClick}
  >
    <ChevronLeftIcon className="w-5 h-5 text-slate-900 group-hover:-translate-x-0.5 transition-transform" />
  </button>
);

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button 
    className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-xl border border-slate-100 hover:bg-white transition-all group hidden lg:block"
    onClick={onClick}
  >
    <ChevronRightIcon className="w-5 h-5 text-slate-900 group-hover:translate-x-0.5 transition-transform" />
  </button>
);

export default function TrendingGallery({ id }: { id: string }) {
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=trending&limit=8`;
  const cacheKey = `products-${id}-trending`;
  const fetcher = createCachedFetcher(cacheKey);

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  const settings = {
    slidesToShow: 4,
    slidesToScroll: 1,
    infinite: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 640,
        settings: { 
          slidesToShow: 1,
          centerMode: true,
          centerPadding: '40px',
          arrows: false,
          dots: true
        }
      }
    ]
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-6 py-20"><SkeletonGrid count={4} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-24 bg-[#F9F8F6] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-rose-500 text-[10px] uppercase tracking-[0.4em] font-black">
                Happening Now
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900">
              Trending <span className="text-slate-400">Atmospheres</span>
            </h2>
          </div>

          <motion.button 
            whileHover={{ x: 5 }}
            onClick={() => window.location.href = `/flowersecommerce/products?flag=trending`}
            className="group flex items-center gap-3 text-slate-900 font-bold uppercase tracking-[0.2em] text-[11px] pb-1 border-b border-slate-300 hover:border-slate-900 transition-colors"
          >
            See What's Popular <ArrowRightIcon className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Carousel Container */}
        <div className="relative px-2">
          <Slider {...settings} className="trending-slider">
            {data.data.map((product: any) => (
              <div key={product.id} className="px-4 py-4">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <style jsx global>{`
        .trending-slider .slick-list {
          overflow: visible;
        }
        .trending-slider .slick-dots {
          bottom: -40px;
        }
        .trending-slider .slick-dots li button:before {
          font-size: 6px;
          color: #cbd5e1;
          opacity: 1;
        }
        .trending-slider .slick-dots li.slick-active button:before {
          color: #0f172a;
        }
      `}</style>
    </section>
  );
}