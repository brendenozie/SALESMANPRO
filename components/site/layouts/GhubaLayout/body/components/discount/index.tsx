"use client";

import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { 
  TagIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowRightIcon,
  PercentBadgeIcon // If using Heroicons v2.1+, otherwise use GiftIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import GhubaProductCard from "../GhubaProductCard";

// --- NAVIGATION ARROWS ---
const CustomPrevArrow = ({ onClick }: any) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl shadow-xl hover:bg-rose-500 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronLeftIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
  </button>
);

const CustomNextArrow = ({ onClick }: any) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 -right-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl shadow-xl hover:bg-rose-500 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronRightIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
  </button>
);

const DiscountSlider = ({ productItems, addToCart }: any) => {
  const [likedItems, setLikedItems] = useState<any>({});
  
  const toggleLike = (id: any) => {
    setLikedItems((prev: any) => ({ ...prev, [id]: !prev[id] }));
  };

  const settings = {
    dots: false,
    infinite: productItems.length > 3,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    speed: 800,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="relative px-2">
      <Slider {...settings}>
        {productItems.map((product: any, index: number) => (
          <div key={index} className="px-4 py-6">
            <GhubaProductCard 
              key={index}
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

const Discount = ({ productItems, addToCart }: any) => {
  const router = useRouter();

  return (
    <section className="relative py-24 bg-white dark:bg-[#080808] transition-colors duration-500 overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-rose-500 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 rounded-full">
                <span className="text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest">
                  Limited Time
                </span>
              </div>
              <span className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
            </div>
            
            <div className="flex items-center gap-6">
               <motion.div
                className="hidden md:flex w-16 h-16 bg-zinc-900 dark:bg-white items-center justify-center rounded-[2rem] shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <TagIcon className="text-white dark:text-zinc-900 h-8 w-8" />
              </motion.div>
              <h2 className="text-4xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
                Big <span className="text-rose-600 italic">Discounts</span>
              </h2>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/ghuba/discounts')}
            className="group flex items-center gap-3 px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl"
          >
            <span>View All Offers</span>
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Content Section */}
        <div className="relative group">
          {/* Subtle focus glow on hover */}
          <div className="absolute inset-0 bg-rose-500/5 rounded-[4rem] scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 pointer-events-none" />
          
          <DiscountSlider productItems={productItems} addToCart={addToCart} />
        </div>

      </div>
    </section>
  );
};

export default Discount;