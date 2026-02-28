'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { motion } from 'framer-motion';
import Slider from 'react-slick';

// Styles for Slick should be imported in your global.css or layout
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const CustomArrow = ({ onClick, direction }: { onClick?: () => void, direction: 'left' | 'right' }) => (
  <button 
    className={`absolute ${direction === 'left' ? '-left-4' : '-right-4'} top-1/2 -translate-y-1/2 z-20 
    w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-xl text-[#3E2723] 
    hover:bg-[#3E2723] hover:text-white transition-all duration-300 border border-stone-100`}
    onClick={onClick}
  >
    {direction === 'left' ? <ChevronLeftIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
  </button>
);

export default function DailyBestSells({ id }: { id: string }) {
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const cacheKey = `products-${id}-isOnOffer`;
  const fetcher = createCachedFetcher(cacheKey);

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
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

  if (isLoading) return <div className="max-w-7xl mx-auto px-6 py-20"><SkeletonGrid count={4} /></div>;
  if (!data?.data?.length) return null;

  return (
    <section className="py-20 bg-[#FAF7F2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-[#8B4513] font-black uppercase tracking-[0.3em] text-[10px]"
            >
              Fresh From The Grinder
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black text-[#3E2723] tracking-tighter">
              Daily Roasts <span className="text-[#F3A852]">&</span> Best Sells
            </h2>
          </div>
          
          <button 
            onClick={() => window.location.href = `/ecommerce/products`}
            className="group flex items-center gap-3 px-6 py-3 bg-white border border-stone-200 rounded-full font-black uppercase tracking-widest text-[10px] text-[#3E2723] hover:bg-[#3E2723] hover:text-white transition-all shadow-sm"
          >
            Explore Full Pantry 
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="relative">
          <Slider {...settings} className="product-slider">
            {data.data.map((product: any) => (
              <div key={product.id} className="px-3 pb-8">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}