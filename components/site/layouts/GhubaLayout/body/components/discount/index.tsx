"use client";

import React, { useState, useCallback } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowRightIcon,
  TagIcon,
  PercentBadgeIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import GhubaProductCard from "../GhubaProductCard";
import dynamic from "next/dynamic";

// --- TYPES ---
interface Product {
  id: string | number;
  [key: string]: any;
}

interface DiscountProps {
  productItems?: Product[];
  addToCart: (product: Product) => void;
}

// Dynamically import Slider ONLY for desktop viewpoints to save initial bundle size
const Slider = dynamic(() => import("react-slick"), { 
  ssr: false,
  loading: () => (
    <div className="flex gap-4 overflow-hidden py-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="min-w-[260px] md:w-1/4 h-[350px] bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
      ))}
    </div>
  )
});

// --- MODERN GLASS ARROWS FOR DESKTOP ---
const CustomPrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    aria-label="Previous discounts"
    className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-xl hover:bg-rose-600 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
  </button>
);

const CustomNextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    aria-label="Next discounts"
    className="absolute top-1/2 -right-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-xl hover:bg-rose-600 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
  </button>
);

const Discount: React.FC<DiscountProps> = ({ productItems = [], addToCart }) => {
  const router = useRouter();
  const [likedItems, setLikedItems] = useState<Record<string | number, boolean>>({});

  const isLoading = !productItems || productItems.length === 0;

  const toggleLike = useCallback((id: string | number) => {
    setLikedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: productItems.length > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    swipeToSlide: true,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <section className="relative py-8 md:py-16 bg-white dark:bg-[#080808] transition-colors duration-300 overflow-hidden">
      
      {/* Decorative Gradient Accents */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-rose-500/5 to-transparent pointer-events-none hidden sm:block" />
      <div className="absolute -top-24 left-[-10%] w-[350px] h-[350px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* Icon Header Accent */}
            <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
              <TagIcon className="w-5 h-5 md:w-6 md:h-6 text-rose-600 dark:text-rose-500" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-rose-600 dark:text-rose-500 text-[10px] md:text-xs font-black uppercase tracking-wider">
                  Limited Time Offers
                </span>
                <PercentBadgeIcon className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              </div>
              <h2 className="text-2xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">
                Big <span className="text-rose-600 italic">Discounts</span>
              </h2>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => router.push('/ghuba/discounts')}
            className="group flex items-center gap-1.5 md:gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold uppercase tracking-wider text-[11px] md:text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 transition-all active:scale-95 shrink-0"
          >
            <span>View All</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-rose-600 dark:text-rose-500" />
          </button>
        </div>

        {/* CONTENT AREA */}
        {isLoading ? (
          /* SKELETON LOADING STATE */
          <div className="flex gap-4 overflow-hidden py-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="min-w-[80vw] sm:min-w-[280px] md:w-1/4 space-y-4 shrink-0">
                <div className="w-full h-[300px] md:h-[350px] bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-2xl" />
                <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-full" />
                <div className="h-4 w-1/3 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* MOBILE VIEW: Hardware-Accelerated CSS Native Scroll Snap */}
            <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-none scroll-smooth">
              {productItems.map((product: Product, index: number) => (
                <div key={product?.id || index} className="snap-start min-w-[80vw] sm:min-w-[300px] shrink-0">
                  <GhubaProductCard 
                    product={product} 
                    toggleLike={toggleLike} 
                    likedItems={likedItems} 
                    addToCart={addToCart} 
                  />
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Loaded via react-slick */}
            <div className="hidden md:block">
              <Slider {...sliderSettings}>
                {productItems.map((product: Product, index: number) => (
                  <div key={product?.id || index} className="px-3 py-2">
                    <GhubaProductCard 
                      product={product} 
                      toggleLike={toggleLike} 
                      likedItems={likedItems} 
                      addToCart={addToCart} 
                    />
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default Discount;