"use client";

import React, { useState, useCallback } from "react";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowRightIcon,
  TagIcon,
  PercentBadgeIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import GhubaProductCard from "../GhubaProductCard";

// CSS Styles for Slick Slider
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// --- TYPES ---
interface Product {
  id: string | number;
  [key: string]: any;
}

interface DiscountProps {
  productItems?: Product[];
  addToCart: (product: Product) => void;
}

// Dynamically import Slider to reduce initial JavaScript bundle size on mobile
const Slider = dynamic(() => import("react-slick"), { 
  ssr: false,
  loading: () => (
    <div className="flex gap-4 overflow-hidden py-4">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className="w-full md:w-1/4 h-[380px] bg-zinc-100 dark:bg-zinc-800/60 rounded-3xl animate-pulse shrink-0" 
        />
      ))}
    </div>
  )
});

// --- MODERN GLASS ARROWS FOR DESKTOP ---
const CustomPrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    type="button"
    aria-label="Previous discounts"
    className="absolute top-1/2 -left-5 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 p-3.5 rounded-2xl shadow-2xl hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 transition-all group hidden lg:block active:scale-95"
  >
    <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
  </button>
);

const CustomNextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    type="button"
    aria-label="Next discounts"
    className="absolute top-1/2 -right-5 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 p-3.5 rounded-2xl shadow-2xl hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 transition-all group hidden lg:block active:scale-95"
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
    <motion.section
      className="relative py-10 md:py-20 bg-zinc-50 dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Decorative Ambient Lighting Orbs */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-5">
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Header Icon Badge */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/10">
              <TagIcon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 dark:text-rose-500" />
            </div>

            <div className="flex flex-col">
              {/* Status Badge */}
              <div className="flex items-center gap-1.5">
                <span className="text-rose-600 dark:text-rose-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">
                  Limited Time Offers
                </span>
                <PercentBadgeIcon className="w-4 h-4 text-rose-500 animate-pulse" />
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none mt-1">
                Big <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 italic">Discounts</span>
              </h2>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/ghuba/discounts')}
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-2xl shadow-xl shadow-zinc-900/10 dark:shadow-white/5 hover:bg-rose-600 dark:hover:bg-rose-600 dark:hover:text-white transition-all text-xs sm:text-sm tracking-wider uppercase shrink-0"
          >
            <span>View All Discounts</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* CONTENT AREA */}
        {isLoading ? (
          /* SKELETON LOADING STATE */
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
            {/* MOBILE VIEW: Hardware-Accelerated CSS Scroll Snap Container */}
            <div 
              className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-6 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6 touch-pan-x overscroll-x-contain"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {productItems.map((product: Product, index: number) => (
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

            {/* DESKTOP VIEW: Loaded via react-slick */}
            <div className="hidden md:block relative">
              <Slider {...sliderSettings}>
                {productItems.map((product: Product, index: number) => (
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

      {/* Scoped CSS overrides for desktop slider track height equality */}
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

export default Discount;