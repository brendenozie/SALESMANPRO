"use client";

import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  BoltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import GhubaProductCard from "../GhubaProductCard";

// --- REFINED ARROWS (Hidden on mobile for better UX) ---
const CustomPrevArrow = ({ onClick }: any) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronLeftIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
  </button>
);

const CustomNextArrow = ({ onClick }: any) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 -right-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronRightIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
  </button>
);

const FlashCardSlider = ({ productItems, addToCart }: any) => {
  const [likedItems, setLikedItems] = useState<any>({});
  
  const toggleLike = (id: any) => {
    setLikedItems((prev: any) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const settings = {
    dots: false,
    infinite: productItems.length > 2,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    // Added swipe and touch improvements
    swipeToSlide: true,
    touchThreshold: 10,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { 
        breakpoint: 640, 
        settings: { 
          slidesToShow: 1.2, // "Peek" effect for the next card
          arrows: false,    // Arrows are clunky on tiny screens
          centerMode: true,  // Centers the active card
          centerPadding: "20px"
        } 
      },
    ],
  };

  return (
    <div className="relative">
      <Slider {...settings} className="py-4 md:py-8">
        {productItems.map((product: any, index: number) => (
          <div key={index} className="px-2 md:px-3 h-full">
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
  );
};

const FlashDeals = ({ productItems, addToCart }: any) => {
  const router = useRouter();

  return (
    <section className="py-12 md:py-20 bg-zinc-50 dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        
        {/* Header - Adjusted for Mobile Stack */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-10 gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
            <motion.div
              className="w-14 h-14 md:w-16 md:h-16 bg-amber-500 flex items-center justify-center rounded-2xl md:rounded-3xl shadow-2xl shadow-amber-500/20"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0] 
              }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <BoltIcon className="text-white h-7 w-7 md:h-9 md:w-9" />
            </motion.div>
            
            <div className="space-y-1">
              <h2 className="text-3xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">
                Flash <span className="text-amber-500 italic">Deals</span>
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">
                <ClockIcon className="w-4 h-4 text-amber-500" />
                <span>Ends in: 12h : 45m : 02s</span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/ghuba/deals')}
            className="group w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all"
          >
            <span>View All</span>
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Content Container - Reduced padding on mobile */}
        <div className="relative rounded-[2rem] md:rounded-[3rem] bg-white/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-2 md:p-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
            <BoltIcon className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] text-amber-500" />
          </div>
          
          <FlashCardSlider productItems={productItems} addToCart={addToCart} />
        </div>

      </div>
    </section>
  );
};

export default FlashDeals;