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
  PercentBadgeIcon 
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import GhubaProductCard from "../GhubaProductCard";

// --- NAVIGATION ARROWS (Desktop Only) ---
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

  // const settings = {
  //   dots: false,
  //   infinite: productItems.length > 2,
  //   slidesToShow: 3,
  //   slidesToScroll: 1,
  //   autoplay: true,
  //   autoplaySpeed: 3500,
  //   speed: 800,
  //   nextArrow: <CustomNextArrow />,
  //   prevArrow: <CustomPrevArrow />,
  //   swipeToSlide: true,
  //   responsive: [
  //     { breakpoint: 1024, settings: { slidesToShow: 2 } },
  //     { 
  //       breakpoint: 640, 
  //       settings: { 
  //         slidesToShow: 1.1, // Slight peek for a focused discount feel
  //         centerMode: true,
  //         centerPadding: "20px",
  //         arrows: false 
  //       } 
  //     },
  //   ],
  // };

  return (
    <div className="relative">
      <Slider {...settings}>
        {productItems.map((product: any, index: number) => (
          <div key={index} className="px-2 md:px-4 py-6">
            <GhubaProductCard 
              key={product.id}
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
    <>
    
    <section className="relative py-16 md:py-24 bg-white dark:bg-[#080808] transition-colors duration-500 overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-rose-500 rounded-full blur-[80px] md:blur-[120px]" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-8">
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 rounded-full">
                <span className="text-rose-600 dark:text-rose-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                  Limited Time
                </span>
              </div>
              <span className="h-[1px] flex-grow md:flex-none md:w-12 bg-zinc-200 dark:bg-zinc-800" />
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
               <motion.div
                className="flex w-12 h-12 md:w-16 md:h-16 bg-zinc-900 dark:bg-white items-center justify-center rounded-2xl md:rounded-[2rem] shadow-2xl shrink-0"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <TagIcon className="text-white dark:text-zinc-900 h-6 w-6 md:h-8 md:w-8" />
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
            className="group w-full md:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl"
          >
            <span>View All</span>
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Content Section */}
        <div className="relative group">
          {/* Subtle focus glow - Adjusted for mobile touch */}
          <div className="absolute inset-0 bg-rose-500/5 rounded-[2rem] md:rounded-[4rem] scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 pointer-events-none hidden md:block" />
          
          <DiscountSlider productItems={productItems} addToCart={addToCart} />
        </div>

      </div>
    </section>

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

export default Discount;