"use client";

import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowRightIcon, 
  SparklesIcon 
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import GhubaProductCard from "../GhubaProductCard";

// --- CUSTOM ARROWS ---
const CustomPrevArrow = ({ onClick }: any) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronLeftIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
  </button>
);

const CustomNextArrow = ({ onClick }: any) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 -right-4 z-20 -translate-y-1/2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronRightIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
  </button>
);

const NewArrivals = ({ productItems, addToCart }: any) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [likedItems, setLikedItems] = useState<any>({});

  const toggleLike = (id: any) => {
    setLikedItems((prev: any) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const settings = {
    dots: false,
    infinite: productItems?.length > 4,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 4,
    slidesToScroll: 1,
    pauseOnHover: true,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <motion.section
      className="relative py-20 bg-white dark:bg-[#080808] transition-colors duration-500"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-[2px] w-8 bg-amber-500" />
              <span className="text-amber-500 text-xs font-black uppercase tracking-[0.3em]">Fresh in stock</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">
              Latest <span className="text-amber-500 italic">Arrivals</span>
            </h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/ghuba/productlist')}
            className="group flex items-center gap-3 px-8 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 transition-all"
          >
            <span>Explore All</span>
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="w-full h-[350px] bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-[2rem]"></div>
                <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-full"></div>
                <div className="h-4 w-1/3 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative px-2">
             <Slider {...settings}>
              {productItems.map((product: any, index: any) => (
                <div key={index} className="px-3 py-4">
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
        )}
      </div>

      {/* Aesthetic Background Detail */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
    </motion.section>
  );
};

export default NewArrivals;