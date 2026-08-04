"use client";

import React, { useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowUpRightIcon,
  Squares2X2Icon 
} from "@heroicons/react/24/outline";
import Image from "next/image";
import load from "@/assets/load.png";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import Slider ONLY for desktop viewpoints to save initial bundle size
const Slider = dynamic(() => import("react-slick"), { 
  ssr: false,
  loading: () => (
    <div className="flex gap-4 overflow-hidden py-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="min-w-[280px] md:w-1/3 h-[380px] md:h-[480px] bg-zinc-100 dark:bg-zinc-800 rounded-[2rem] animate-pulse" />
      ))}
    </div>
  )
});

const loaderProp = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width || 800}&q=${quality || 75}`;
};

// --- MODERN GLASS ARROWS FOR DESKTOP ---
const CustomPrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    aria-label="Previous categories"
    className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
  </button>
);

const CustomNextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    aria-label="Next categories"
    className="absolute top-1/2 -right-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
  </button>
);

const TopCate = ({ categories = [] }: { categories?: any[] }) => {
  const router = useRouter();

  const settings = {
    dots: false,
    infinite: categories.length > 3,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 800,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
    ],
  };

  if (!categories.length) return null;

  return (
    <section className="relative py-8 md:py-16 bg-white dark:bg-[#080808] transition-colors duration-300 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        {/* HEADER SECTION: Mobile-optimized alignment */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
              <Squares2X2Icon className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
            </div>
            
            <div className="flex flex-col">
              <span className="text-amber-500 text-[10px] md:text-xs font-black uppercase tracking-wider">
                Curated Collections
              </span>
              <h2 className="text-2xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">
                Top <span className="text-amber-500 italic">Categories</span>
              </h2>
            </div>
          </div>

          {/* Action CTA */}
          <button
            onClick={() => router.push('/ghuba/categories')}
            className="group flex items-center gap-1.5 md:gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold uppercase tracking-wider text-[11px] md:text-xs rounded-xl shadow-md active:scale-95 transition-all shrink-0"
          >
            <span>Catalog</span>
            <ArrowUpRightIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* CONTENT CONTAINER */}
        <div className="relative">
          
          {/* MOBILE VIEW: Hardware-Accelerated CSS Native Scroll Snap */}
          <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-none scroll-smooth">
            {categories.map((value, index) => (
              <div key={value.id || index} className="snap-start min-w-[82vw] sm:min-w-[320px] shrink-0">
                <CategoryCard value={value} />
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: Loaded via react-slick */}
          <div className="hidden md:block">
            <Slider {...settings}>
              {categories.map((value, index) => (
                <div key={value.id || index} className="px-3 py-2">
                  <CategoryCard value={value} />
                </div>
              ))}
            </Slider>
          </div>

        </div>
      </div>
    </section>
  );
};

function CategoryCard({ value }: { value: { id: string; name: string; image: string; tags?: string[] } }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link 
      href={`/ghuba/productlist?categoryId=${value.id}`} 
      className="relative group cursor-pointer h-[380px] md:h-[480px] w-full overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-md block bg-zinc-100 dark:bg-zinc-900"
    >
      {/* Background Image */}
      <Image
        fill
        loader={loaderProp}
        src={imageError ? load.src : value.image}
        alt={value.name}
        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        onError={() => setImageError(true)}
      />

      {/* Multi-Layer Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300" />
      
      {/* Card Content Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col justify-end space-y-3 md:space-y-4">
        
        {/* Dynamic Category Tags */}
        {value.tags && value.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {value.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-[9px] font-bold uppercase tracking-wider text-white bg-amber-500/90 backdrop-blur-md px-2.5 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-end gap-3">
          <div>
            <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1">
              Explore
            </p>
            <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight">
              {value.name}
            </h3>
          </div>
          
          {/* Circular Navigation Indicator Badge */}
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:translate-x-2 md:group-hover:translate-x-0">
            <ArrowUpRightIcon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Subtle border highlight on hover */}
      <div className="absolute inset-0 border-2 border-amber-500/0 group-hover:border-amber-500/40 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-300 pointer-events-none" />
    </Link>
  );
}

export default TopCate;