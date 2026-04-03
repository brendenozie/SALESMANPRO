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
        className="relative w-full min-h-[550px] md:h-[650px] flex flex-col md:flex-row items-center justify-between overflow-hidden group 
                   bg-zinc-50 dark:bg-zinc-950 
                   rounded-[3rem] md:rounded-[4rem] 
                   border border-zinc-200 dark:border-zinc-800 
                   transition-colors duration-500"
      >
        {/* Layered Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src={slide.bgImage}
            fill
            alt="Background"
            className="object-cover opacity-20 dark:opacity-30 grayscale group-hover:scale-105 transition-transform duration-[10s]"
            loader={loader}
          />
          {/* Light Mode Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-zinc-50/80 to-transparent dark:hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-transparent dark:hidden" />
          
          {/* Dark Mode Gradients */}
          <div className="absolute inset-0 hidden dark:block bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-20 w-full md:w-1/2 p-8 md:p-24 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full w-fit"
          >
            <SparklesIcon className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            <span className="text-amber-600 dark:text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">
              Exclusive Deal
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-8xl font-black uppercase leading-[0.9] text-zinc-900 dark:text-white tracking-tighter transition-colors">
            {slide.title}
          </h2>

          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-medium max-w-sm leading-relaxed transition-colors">
            {slide.description}
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group/btn relative px-10 py-5 bg-amber-500 text-white dark:text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center gap-3 overflow-hidden shadow-lg shadow-amber-500/20"
          >
            <span className="relative z-10">Shop Now</span>
            <ArrowRightIcon className="w-4 h-4 z-10 group-hover/btn:translate-x-2 transition-transform" />
            {/* Glossy Overlay for Light/Dark feel */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity" />
          </motion.button>
        </div>

        {/* Image Display */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full md:w-1/2 h-[350px] md:h-full flex justify-center items-center p-12"
        >
          <div className="relative w-full h-full group-hover:drop-shadow-[0_0_50px_rgba(245,158,11,0.2)] transition-all duration-700">
            <Image
              src={slide.img}
              loader={loader}
              alt={slide.title}
              fill
              className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
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