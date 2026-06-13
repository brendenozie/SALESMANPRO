'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { 
  ArrowRightIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { useStoreContext } from '@/contexts/StoreContext';
import Slider from 'react-slick';

// Standard Slick CSS imports (ensure these are in your global CSS or here)
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion } from 'framer-motion';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button 
    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-zinc-900 p-3 rounded-full shadow-xl border border-zinc-100 dark:border-zinc-800 transition-transform active:scale-90"
    onClick={onClick}
  >
    <ChevronLeftIcon className="w-5 h-5 text-zinc-900 dark:text-white" />
  </button>
);

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button 
    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-zinc-900 p-3 rounded-full shadow-xl border border-zinc-100 dark:border-zinc-800 transition-transform active:scale-90"
    onClick={onClick}
  >
    <ChevronRightIcon className="w-5 h-5 text-zinc-900 dark:text-white" />
  </button>
);

export default function WeeklyProducts({ id }: { id: string }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#ef4444';
  
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
    arrows: true,
    dots: true,
    infinite: false,
    nextArrow: <NextArrow />, 
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, centerMode: true, centerPadding: '40px' }
      }
    ]
  };

  if (isLoading) <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>;
  if (error || !data?.data?.length) return null;

  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        
        {/* --- Section Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">
                Curated Selection
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
              Popular <span className="font-serif italic font-light text-zinc-400">Products</span>
            </h2>
          </div>

          <button
            onClick={() => { window.location.href = `/furnitureecommerce/products?filter=onOffer`; }}
            className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white hover:opacity-70 transition-all"
          >
            Explore All 
            <span className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-full group-hover:translate-x-1 transition-transform">
              <ArrowRightIcon className="w-4 h-4" />
            </span>
          </button>
        </div>

        {/* --- Carousel: Mobile --- */}
        <div className="md:hidden relative px-2 mb-10"> 
          <Slider {...settings} className="product-slider">
            {data.data.map((product: any) => (
              <div key={product.id} className="px-2 outline-none">
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
      `}</style>
    </section>
  );
}