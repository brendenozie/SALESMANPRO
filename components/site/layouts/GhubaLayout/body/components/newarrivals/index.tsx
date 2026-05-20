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

// --- CUSTOM ARROWS (Desktop Only) ---
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
    infinite: productItems.length > 4,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    swipeToSlide: true,
    touchThreshold: 10,

    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1.05,
          slidesToScroll: 1,
          arrows: false,
          infinite: false,
        },
      },
    ],
  };


  return (
    <>
    <motion.section
      className="relative py-12 md:py-20 bg-white dark:bg-[#080808] transition-colors duration-500"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        
        {/* Header Section - Better Mobile Alignment */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-[2px] w-6 md:w-8 bg-amber-500" />
              <span className="text-amber-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Fresh in stock</span>
            </div>
            <h2 className="text-3xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
              Latest <span className="text-amber-500 italic">Arrivals</span>
            </h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/ghuba/productlist')}
            className="group w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 transition-all text-sm"
          >
            <span>Explore All</span>
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="w-full h-[300px] md:h-[350px] bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-[1.5rem] md:rounded-[2rem]"></div>
                <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-full"></div>
                <div className="h-4 w-1/3 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
             <Slider {...settings}>
              {productItems.map((product: any, index: any) => (
                <div key={index} className="px-2 md:px-3 py-4">
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

      {/* Aesthetic Background Detail - Hidden on smallest screens for performance */}
      <div className="hidden sm:block absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
    </motion.section>

    {/* // add custom style  */}
      <style>{`
        /* Custom styles for slick dots */
        .slick-dots {
          bottom: -30px;
        }
        .slick-dots li button:before {
          font-size: 10px;
          color: #cbd5e1; /* Tailwind's zinc-400 */
          opacity: 1;
        }
        .slick-dots li.slick-active button:before {
          color: #fbbf24; /* Tailwind's amber-500 */
        }

        .slick-list {
          padding: 12px 0 !important;
        }

        .slick-track {
          display: flex !important;
        }

        .slick-slide {
          height: inherit !important;
        }

        .slick-slide > div {
          height: 100%;
        }
      `}
      </style>
      </>
  );
};

export default NewArrivals;