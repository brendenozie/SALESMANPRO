"use client";

import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowUpRightIcon,
  Squares2X2Icon 
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";
import load from "@/assets/load.png";
import Link from "next/link";

const loaderProp = ({ src, width, quality }: any) => {
  return `${src}?w=${width || 800}&q=${quality || 75}`;
};

// --- MODERN GLASS ARROWS ---
const CustomPrevArrow = ({ onClick }: any) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-2xl hover:bg-amber-500 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronLeftIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
  </button>
);

const CustomNextArrow = ({ onClick }: any) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 -right-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-2xl hover:bg-amber-500 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronRightIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
  </button>
);

const TopCate = ({ categories }: { categories: any[] }) => {
  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 1000,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    cssEase: "cubic-bezier(0.23, 1, 0.32, 1)", // Smoother exponential ease
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
    appendDots: (dots: any) => (
      <div className="mt-12">
        <ul className="flex justify-center items-center gap-3">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 hover:bg-amber-500 transition-all duration-300" />
    ),
  };

  return (
    <section className="relative py-24 bg-white dark:bg-[#080808] transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Squares2X2Icon className="w-5 h-5 text-amber-500" />
              <span className="text-amber-500 text-xs font-black uppercase tracking-[0.3em]">Curated Collections</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
              Top <span className="text-amber-500 italic">Categories</span>
            </h2>
          </div>

          <motion.button
            onClick={() => window.location.href = '/ghuba/categories'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl"
          >
            <span>Browse Full Catalog</span>
            <ArrowUpRightIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        </div>

        {/* Categories Slider */}
        <div className="relative">
          <Slider {...settings}>
            {categories.map((value, index) => (
              <div key={index} className="px-4">
                <CategoryCard value={value} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

function CategoryCard({ value }: { value: any }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/ghuba/productlist?categoryId=${value.id}`} className="relative group cursor-pointer h-[500px] w-full overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-lg">
      <div className="relative group cursor-pointer h-[500px] w-full overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-lg">
        {/* Main Image */}
        <Image
          fill
          loader={loaderProp}
          src={imageError ? load.src : value.image}
          alt={value.name}
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          onError={() => setImageError(true)}
        />

        {/* Dynamic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Content Cockpit */}
        <div className="absolute inset-x-0 bottom-0 p-8 space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <div className="flex flex-wrap gap-2">
            {value.tags?.slice(0, 2).map((tag: string, idx: number) => (
              <span
                key={idx}
                className="text-[9px] font-black uppercase tracking-widest text-white bg-amber-500/80 backdrop-blur-md px-3 py-1 rounded-lg"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-1">Explore</p>
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                {value.name}
              </h3>
            </div>
            
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
              <ArrowUpRightIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Subtle border shine on hover */}
        <div className="absolute inset-0 border-2 border-amber-500/0 group-hover:border-amber-500/50 rounded-[2.5rem] transition-all duration-500 pointer-events-none" />
      </div>
    </Link>
  );
}

export default TopCate;