"use client";

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const loader = ({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`;

// --- BRAND CONSTANTS ---
const BRAND_GOLD = "#F59E0B";

// --- REFINED ARROWS ---
const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 left-4 z-30 -translate-y-1/2 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl hover:bg-amber-500 hover:border-amber-400 transition-all group hidden md:block"
  >
    <ChevronLeftIcon className="h-6 w-6 text-black dark:text-white group-hover:scale-110 transition-transform" />
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 right-4 z-30 -translate-y-1/2 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl hover:bg-amber-500 hover:border-amber-400 transition-all group hidden md:block"
  >
    <ChevronRightIcon className="h-6 w-6 text-black dark:text-white group-hover:scale-110 transition-transform" />
  </button>
);

// --- REFINED CATEGORIES ---
const CategoriesGrid = ({ categories }) => {
  const router = useRouter();
  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 px-4 py-10">
      {categories.map(({ name, icon }, index) => (
        <motion.div
          key={index}
          onClick={() => router.push(`/ghuba/productlist?category=${name}`)}
          whileHover={{ y: -8 }}
          className="group relative flex flex-col items-center p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.0rem] cursor-pointer transition-all hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10"
        >
          <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-2xl shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
            <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
          </div>
          <p className="mt-4 font-black text-center text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 group-hover:text-amber-500">
            {name}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

// --- REFINED SLIDE CARD ---

const SlideCard = ({ slide }) => {
  return (
    <div className="px-2">
      <motion.div
        className="relative w-full min-h-[500px] md:h-[600px] flex flex-col md:flex-row overflow-hidden group 
                   bg-zinc-50 dark:bg-zinc-950 
                   rounded-[2.5rem] md:rounded-[4rem] 
                   border border-zinc-200 dark:border-zinc-800 
                   transition-colors duration-500"
      >
        {/* Layered Background - Simplified for Mobile */}
        <div className="absolute inset-0 z-0">
          <Image
            src={slide.bgImage}
            fill
            alt="Background"
            className="object-cover opacity-20 dark:opacity-30 grayscale group-hover:scale-105 transition-transform duration-[10s] min-h-[500px] md:min-h-[600px] h-[500px] md:h-[600px]"
            loader={loader}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/50 via-zinc-50/80 to-zinc-50 dark:from-black/50 dark:via-black/80 dark:to-black" />
        </div>

        {/* Content - Optimized Padding & Font Scaling */}
        <div className="relative z-20 w-full md:w-1/2 p-8 sm:p-12 md:p-24 flex flex-col justify-center order-2 md:order-1">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full w-fit mb-6"
          >
            <SparklesIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
            <span className="text-amber-600 dark:text-amber-500 text-[9px] font-black uppercase tracking-[0.2em]">
              Exclusive Deal
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase leading-[0.9] text-zinc-900 dark:text-white tracking-tighter mb-6 transition-colors">
            {slide.title}
          </h2>

          <p className="text-sm sm:text-lg text-zinc-600 dark:text-zinc-400 font-medium max-w-sm leading-relaxed mb-8 transition-colors">
            {slide.description}
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20"
          >
            <span>Shop Now</span>
            <ArrowRightIcon className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Image Display - Constrained for Mobile */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full md:w-1/2 h-[250px] sm:h-[300px] md:h-full flex justify-center items-center order-1 md:order-2 p-6 md:p-12"
        >
          <div className="relative w-full h-full max-w-[300px] md:max-w-none group-hover:drop-shadow-[0_0_50px_rgba(245,158,11,0.15)] transition-all duration-700">
            <Image
              src={slide.img}
              loader={loader}
              alt={slide.title}
              fill
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] min-h-[250px] sm:min-h-[300px] md:min-h-[400px] h-[250px] sm:h-[300px] md:h-[400px] transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// --- MAIN SECTION ---
const BannerSlider = ({ categories }) => {
  const promoSlides = [
    { id: 1, title: "Modern Heritage", description: "Discover the best of African fashion and craftsmanship.", img: "/images/SlideCard/slide-1.png", bgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d" },
    { id: 2, title: "Tech Pulse", description: "Stay ahead with the latest certified electronics.", img: "/images/SlideCard/slide-2.png", bgImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c" },
    { id: 3, title: "Urban Living", description: "Transform your space with curated home essentials.", img: "/images/SlideCard/slide-3.png", bgImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7" },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    appendDots: dots => <div style={{ bottom: "40px" }} className="custom-dots">{dots}</div>,
  };

  return (
    <section className="min-h-screen bg-white dark:bg-[#080808] transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto py-12 px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 text-center justify-items-center w-full mx-auto"> 
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full ">
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
              Uncover <span className="text-amber-500 italic">Exclusive</span> Deals
            </h1>
            <p className="mt-4 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.4em] text-xs">
              Ghuba Marketplace • Premium Collection
            </p>
          </motion.div>
        </div>

        <CategoriesGrid categories={categories} />

        <div className="mt-12">
          <Slider {...settings}>
            {promoSlides.map((slide) => (
              <SlideCard key={slide.id} slide={slide} />
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default BannerSlider;