'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { 
  ArrowRightIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  FireIcon 
} from '@heroicons/react/24/solid';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import Slider from 'react-slick';
import { motion } from 'framer-motion';

// Slider styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const CustomArrow = ({ direction, onClick }: { direction: 'left' | 'right', onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`absolute top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl border border-slate-100 hover:scale-110 active:scale-95 transition-all
      ${direction === 'left' ? '-left-6' : '-right-6'}`}
  >
    {direction === 'left' ? <ChevronLeftIcon className="w-6 h-6 text-slate-900" /> : <ChevronRightIcon className="w-6 h-6 text-slate-900" />}
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
    slidesToShow: 4,
    slidesToScroll: 1,
    infinite: true,
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1, centerMode: true, centerPadding: '40px' } }
    ]
  };

  if (isLoading) return <div className="py-20"><SkeletonGrid count={4} /></div>;
  if (!data?.data?.length) return null;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Header: High Tension Styling */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100">
                <FireIcon className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Trending Now</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
              Daily Best <br /> <span className="text-slate-300">Sellers.</span>
            </h2>
          </div>
          
          <button 
            onClick={() => window.location.href = `/ecommerce/products`}
            className="group flex items-center gap-3 px-8 py-4 bg-slate-900 rounded-full text-white font-bold transition-all hover:pr-10"
          >
            Explore All <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Carousel / Grid Wrapper */}
        <div className="relative px-2">
          <Slider {...settings}>
            {data.data.map((product: any, idx: number) => (
              <div key={product.id} className="px-3 pb-10">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}