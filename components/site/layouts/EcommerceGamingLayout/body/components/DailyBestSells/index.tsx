'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import Slider from 'react-slick';
import { motion } from 'framer-motion';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css'; 

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

const CustomArrow = ({ onClick, direction }: { onClick?: () => void, direction: 'L' | 'R' }) => (
  <button 
    className={`absolute ${direction === 'L' ? '-left-4' : '-right-4'} top-1/2 -translate-y-1/2 z-20 bg-red-600 text-white p-3 hover:bg-zinc-900 dark:hover:bg-white dark:hover:text-black transition-all hidden md:block shadow-xl`}
    onClick={onClick}
  >
    {direction === 'L' ? <ChevronLeftIcon className="w-6 h-6" /> : <ChevronRightIcon className="w-6 h-6" />}
  </button>
);

export default function DailyBestSells({ id }: { id: string }) {
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const fetcher = createCachedFetcher(`products-${id}-isOnOffer`);

  const { data, error, isLoading } = useSWR(url, fetcher, { revalidateOnFocus: true });

  const settings = {
    slidesToShow: 4,
    slidesToScroll: 1,
    infinite: true,
    nextArrow: <CustomArrow direction="R" />,
    prevArrow: <CustomArrow direction="L" />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1, centerMode: true, centerPadding: '40px' } }
    ]
  };

  if (isLoading) return (
    <div className="bg-zinc-50 dark:bg-black py-20 transition-colors duration-500">
      <SkeletonGrid count={4} />
    </div>
  );
  
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-24 bg-zinc-50 dark:bg-black relative overflow-hidden transition-colors duration-500">
      {/* Background HUD Grid - Subtle Red dots adapted for both modes */}
      <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle, #FF003C 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-l-4 border-red-600 pl-6">
          <div>
            <span className="text-red-600 font-mono text-xs tracking-[0.5em] uppercase mb-2 block animate-pulse">
              Hot_Drops_Detected
            </span>
            <h2 className="text-4xl md:text-6xl font-black italic text-zinc-900 dark:text-white uppercase tracking-tighter transition-colors">
              DAILY <span className="text-red-600">BEST SELLS</span>
            </h2>
          </div>
          
          <button 
            onClick={() => window.location.href = `/gamingecommerce/products`}
            className="group flex items-center gap-3 text-zinc-900 dark:text-white font-black italic tracking-tighter hover:text-red-600 transition-all mt-6 md:mt-0"
          >
            EXPAND_CATALOG <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        <div className="relative product-slick-container">
          <Slider {...settings}>
            {data.data.map((product: any) => (
              <div key={product.id} className="px-3 outline-none py-4">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <style jsx global>{`
        .product-slick-container .slick-dots li button:before { 
          color: #888; 
          transition: color 0.3s ease;
        }
        .product-slick-container .slick-dots li.slick-active button:before { 
          color: #FF003C; 
        }
        /* Fix for card shadows getting clipped in the slider */
        .product-slick-container .slick-list {
          padding: 20px 0;
          margin: 0 -10px;
        }
      `}</style>
    </section>
  );
}