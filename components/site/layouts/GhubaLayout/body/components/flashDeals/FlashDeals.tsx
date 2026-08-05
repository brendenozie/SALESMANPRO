"use client";

import React, { useState, useCallback } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  BoltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import GhubaProductCard from "../GhubaProductCard";
import dynamic from "next/dynamic";

interface Product {
  id: string | number;
  [key: string]: any;
}

interface FlashDealsProps {
  productItems?: Product[];
  addToCart: (product: Product) => void;
}

// Dynamically import Slider ONLY for desktop viewports to reduce initial JavaScript payload
const Slider = dynamic(() => import("react-slick"), { 
  ssr: false,
  loading: () => (
    <div className="flex gap-4 overflow-hidden py-4">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className="w-full md:w-1/4 h-[380px] bg-zinc-200 dark:bg-zinc-800/60 rounded-2xl animate-pulse shrink-0" 
        />
      ))}
    </div>
  )
});

const CustomPrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    type="button"
    aria-label="Previous deals"
    className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 p-3 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-all group hidden md:block"
  >
    <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
  </button>
);

const CustomNextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    type="button"
    aria-label="Next deals"
    className="absolute top-1/2 -right-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 p-3 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-all group hidden md:block"
  >
    <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
  </button>
);

const FlashDeals: React.FC<FlashDealsProps> = ({ productItems = [], addToCart }) => {
  const router = useRouter();
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  const toggleLike = useCallback((id: string) => {
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
    autoplaySpeed: 4000,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    swipeToSlide: true,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
    ],
  };

  if (!productItems.length) return null;

  return (
    <section className="py-6 md:py-12 bg-zinc-50 dark:bg-[#0a0a0a] transition-colors duration-300 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between gap-3 mb-6 md:mb-8">
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Animated Icon */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-amber-500 flex items-center justify-center rounded-xl md:rounded-2xl shadow-lg shadow-amber-500/25 shrink-0 animate-pulse">
              <BoltIcon className="text-white h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
            </div>

            <div className="flex flex-col">
              <h2 className="text-xl sm:text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">
                Flash <span className="text-amber-500 italic">Deals</span>
              </h2>
              
              {/* Countdown badge */}
              <div className="flex items-center gap-1.5 mt-1 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                <ClockIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Ends: <strong className="text-zinc-800 dark:text-zinc-200">12h 45m 02s</strong></span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => router.push('/ghuba/deals')}
            className="group flex items-center gap-1 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold uppercase tracking-wider text-[10px] sm:text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all shrink-0"
          >
            <span>View All</span>
            <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* CONTENT CONTAINER */}
        <div className="relative">
          {/* BACKGROUND DECORATION */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <BoltIcon className="w-[280px] h-[280px] md:w-[450px] md:h-[450px] text-amber-500" />
          </div>

          {/* MOBILE VIEW: Fixed-width responsive scroll snap container */}
          <div 
            className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-3.5 sm:gap-4 pb-4 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6 touch-pan-x overscroll-x-contain"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {productItems.map((product, index) => (
              <div 
                key={product.id || index} 
                className="snap-start w-[240px] xs:w-[260px] sm:w-[280px] shrink-0 flex flex-col"
              >
                <div className="h-full">
                  <GhubaProductCard
                    product={product}
                    toggleLike={toggleLike}
                    likedItems={likedItems}
                    addToCart={addToCart}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: Carousel via react-slick */}
          <div className="hidden md:block">
            <Slider {...sliderSettings}>
              {productItems.map((product, index) => (
                <div key={product.id || index} className="px-2.5 py-2">
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

      </div>
    </section>
  );
};

export default FlashDeals;