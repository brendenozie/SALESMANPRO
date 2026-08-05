"use client";

import React, { useState, useCallback } from "react";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowRightIcon,
  SparklesIcon,
  FireIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import GhubaProductCard from "../GhubaProductCard";

// CSS Styles for Slick Slider
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Product {
  id: string | number;
  [key: string]: any;
}

interface NewArrivalsProps {
  productItems?: Product[];
  addToCart: (product: Product) => void;
}

// Dynamically import Slider to reduce initial JavaScript bundle size on mobile
const Slider = dynamic(() => import("react-slick"), { 
  ssr: false,
  loading: () => (
    <div className="flex gap-4 overflow-hidden py-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-full md:w-1/4 h-[380px] bg-zinc-100 dark:bg-zinc-800/60 rounded-3xl animate-pulse shrink-0" />
      ))}
    </div>
  )
});

// Glassmorphism Navigation Buttons for Desktop
const CustomPrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    type="button"
    aria-label="Previous products"
    className="absolute top-1/2 -left-5 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 p-3.5 rounded-2xl shadow-2xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-all group hidden lg:block active:scale-95"
  >
    <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
  </button>
);

const CustomNextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    type="button"
    aria-label="Next products"
    className="absolute top-1/2 -right-5 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 p-3.5 rounded-2xl shadow-2xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-all group hidden lg:block active:scale-95"
  >
    <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
  </button>
);

const NewArrivals: React.FC<NewArrivalsProps> = ({ productItems = [], addToCart }) => {
  const router = useRouter();
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

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
    speed: 600,
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

  return (
    <motion.section
      className="relative py-10 md:py-20 bg-zinc-50 dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-5">
          <div className="space-y-2 md:space-y-3">
            
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 rounded-full">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-amber-600 dark:text-amber-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.25em]">
                Just Dropped
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 italic">Arrivals</span>
            </h2>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/ghuba/productlist')}
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-2xl shadow-xl shadow-zinc-900/10 dark:shadow-white/5 hover:bg-amber-500 dark:hover:bg-amber-500 dark:hover:text-white transition-all text-xs sm:text-sm tracking-wider uppercase"
          >
            <span>Explore Collection</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* CONTENT SECTION */}
        {isLoading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="space-y-3">
                <div className="w-full h-[260px] sm:h-[320px] bg-zinc-100 dark:bg-zinc-800/60 animate-pulse rounded-3xl" />
                <div className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-800/60 animate-pulse rounded-full" />
                <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-800/60 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* MOBILE VIEW: Hardware-Accelerated CSS Snap Scroll */}
            <div 
              className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-6 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6 touch-pan-x overscroll-x-contain"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {productItems.map((product, index) => (
                <div 
                  key={product?.id || index} 
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

            {/* DESKTOP VIEW: React Slick Slider */}
            <div className="hidden md:block relative">
              <Slider {...sliderSettings}>
                {productItems.map((product, index) => (
                  <div key={product?.id || index} className="px-2.5 py-3">
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

      {/* Scoped CSS overrides for desktop slider track height */}
      <style jsx global>{`
        .slick-track {
          display: flex !important;
          align-items: stretch !important;
        }
        .slick-slide {
          height: auto !important;
        }
        .slick-slide > div {
          height: 100%;
        }
      `}</style>
    </motion.section>
  );
};

export default NewArrivals;