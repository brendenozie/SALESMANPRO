"use client";

import React, { useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

// Ensure type is imported if you are using TypeScript strictly, or use 'any'
// import { StoreForm } from '@/types/typings'; 

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// --- REFINED ARROWS ---
const CustomPrevArrow = ({ onClick }: any) => (
  <button
    onClick={onClick}
    aria-label="Previous slide"
    className="absolute top-1/2 left-4 z-30 -translate-y-1/2 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl hover:bg-amber-500 hover:border-amber-400 transition-all duration-300 group hidden md:block"
  >
    <ChevronLeftIcon className="h-6 w-6 text-black dark:text-white group-hover:scale-110 transition-transform" />
  </button>
);

const CustomNextArrow = ({ onClick }: any) => (
  <button
    onClick={onClick}
    aria-label="Next slide"
    className="absolute top-1/2 right-4 z-30 -translate-y-1/2 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl hover:bg-amber-500 hover:border-amber-400 transition-all duration-300 group hidden md:block"
  >
    <ChevronRightIcon className="h-6 w-6 text-black dark:text-white group-hover:scale-110 transition-transform" />
  </button>
);

// --- REFINED CATEGORIES ---
const CategoriesGrid = ({ categories }: any) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 px-4 py-10">
      {categories?.map(({ name, icon }: any, index: number) => (
        <Link
          key={index}
          href={`/ghuba/productlist?category=${encodeURIComponent(name)}`}
          prefetch={true}
          className="group relative flex flex-col items-center p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.0rem] cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 active:scale-95"
        >
          <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-2xl shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
            <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
          </div>
          <p className="mt-4 font-black text-center text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 group-hover:text-amber-500 transition-colors">
            {name}
          </p>
        </Link>
      ))}
    </div>
  );
};

// --- REFINED SLIDE CARD (UPDATED WITH NEW DATA STRUCTURE) ---
const SlideCard = ({ slide, isPriority }: any) => {
  const router = useRouter();

  return (
    <div className="px-2">
      <div
        className="relative w-full min-h-[500px] md:h-[600px] flex flex-col md:flex-row overflow-hidden group 
                   bg-zinc-50 dark:bg-zinc-950 
                   rounded-[2.5rem] md:rounded-[4rem] 
                   border border-zinc-200 dark:border-zinc-800 
                   transition-colors duration-500"
      >
        {/* Layered Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src={slide.imageUrl || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop'}
            fill
            alt={slide.headline || "Background"}
            priority={isPriority}
            sizes="100vw"
            quality={60}
            className="object-cover opacity-20 dark:opacity-30 grayscale group-hover:scale-105 transition-transform duration-[10s] min-h-[500px] md:min-h-[600px] h-[500px] md:h-[600px]"
            loader={loader}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/50 via-zinc-50/80 to-zinc-50 dark:from-black/50 dark:via-black/80 dark:to-black" />
        </div>

        {/* Content */}
        <div className="relative z-20 w-full md:w-1/2 p-8 sm:p-12 md:p-24 flex flex-col justify-center order-2 md:order-1">
          
          <div className={`${!isPriority ? 'animate-fade-in-up' : ''} flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full w-fit mb-6`}>
            <SparklesIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
            <span className="text-amber-600 dark:text-amber-500 text-[9px] font-black uppercase tracking-[0.2em]">
              {slide.badgeText || "Exclusive Deal"}
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase leading-[0.9] text-zinc-900 dark:text-white tracking-tighter mb-6 transition-colors whitespace-pre-line">
            {slide.headline}
          </h2>

          <p className="text-sm sm:text-lg text-zinc-600 dark:text-zinc-400 font-medium max-w-sm leading-relaxed mb-8 transition-colors">
            {slide.subline}
          </p>

          <div className={`flex flex-wrap items-center gap-6 ${!isPriority ? 'animate-fade-in-up' : ''}`}>
            <button
              onClick={() => {
                if (slide.trackingPayload) {
                  fetch('/api/ads/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      type: 'CLICK',
                      campaignId: slide.trackingPayload.campaignId,
                      creativeId: slide.trackingPayload.creativeId,
                      placementCode: slide.trackingPayload.placementCode || 'GHUBA_HOMEPAGE_HERO',
                    }),
                  }).catch(() => {});
                }
                router.push(slide.ctaLink || '/shop');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-transform duration-300"
            >
              <span>{slide.ctaText || "Shop Now"}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
            
            {/* Added Price rendering from new structure */}
            {slide.price && (
              <span className="text-zinc-900 dark:text-white font-black text-xl tracking-tight">
                {slide.price}
              </span>
            )}
          </div>
        </div>

        {/* Image Display */}
        <div className={`${!isPriority ? 'animate-zoom-in' : ''} relative z-10 w-full md:w-1/2 h-[250px] sm:h-[300px] md:h-full flex justify-center items-center order-1 md:order-2 p-6 md:p-12`}>
          <div className="relative w-full h-full max-w-[300px] md:max-w-none group-hover:drop-shadow-[0_0_50px_rgba(245,158,11,0.15)] transition-all duration-700">
            <Image
              src={slide.productImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop'}
              loader={loader}
              alt={slide.headline || "Product Image"}
              fill
              priority={isPriority}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] min-h-[250px] sm:min-h-[300px] md:min-h-[400px] h-[250px] sm:h-[300px] md:h-[400px] transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const sampleSlides = [
  {
    id: "modern-heritage",
    headline: "MODERN\nHERITAGE.",
    badgeText: "African Fashion / Collection 2026",
    subline:
      "Discover the finest African fashion, handcrafted accessories, and timeless craftsmanship from talented local artisans.",
    ctaText: "Shop Collection",
    ctaLink: "/shop",
    imageUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    productImageUrl: "/images/SlideCard/slide-1.png",
    price: "From $49.00",
  },
  {
    id: "tech-pulse",
    headline: "TECH\nPULSE.",
    badgeText: "Certified Electronics / Latest Tech",
    subline:
      "Stay ahead with premium smartphones, laptops, smart gadgets, and cutting-edge electronics from trusted brands.",
    ctaText: "Explore Tech",
    ctaLink: "/shop",
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
    productImageUrl: "/images/SlideCard/slide-2.png",
    price: "From $199.00",
  },
  {
    id: "urban-living",
    headline: "URBAN\nLIVING.",
    badgeText: "Home Essentials / Modern Living",
    subline:
      "Transform your home with stylish furniture, décor, lighting, and carefully curated essentials for every room.",
    ctaText: "Discover Home",
    ctaLink: "/shop",
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop",
    productImageUrl: "/images/SlideCard/slide-3.png",
    price: "From $39.00",
  },
];

// --- MAIN SECTION ---
const BannerSlider = ({ categories = [], pageData }: { categories: any[], pageData: any }) => {

  const heroSlides = pageData?.heroSlides || [];

  const promoSlides = useMemo(() => {
    const fallback = 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop';
    
    
    if (!heroSlides || heroSlides.length === 0) return sampleSlides.map(slide => ({ ...slide, imageUrl: fallback, productImageUrl: fallback }));
    return heroSlides;
  }, [heroSlides]);

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
    appendDots: (dots: any) => <div style={{ bottom: "40px" }} className="custom-dots">{dots}</div>,
  };

  return (
    <>
      <section className="min-h-screen bg-white dark:bg-[#080808] transition-colors duration-500">
        <div className="max-w-[1600px] mx-auto py-12 px-4">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 text-center justify-items-center w-full mx-auto"> 
            <div className="w-full">
              <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                Uncover <span className="text-amber-500 italic">Exclusive</span> Deals
              </h1>
              <p className="mt-4 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.4em] text-xs">
                Ghuba Marketplace • Premium Collection
              </p>
            </div>
          </div>

          <CategoriesGrid categories={categories} />

          <div className="mt-12">
            <Slider {...settings}>
              {promoSlides.map((slide: any, index: number) => (
                <SlideCard 
                  key={slide.id || index} 
                  slide={slide} 
                  isPriority={index === 0} // Highest priority for LCP
                />
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* Pure CSS Animations replacing Framer Motion */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-zoom-in {
          animation: zoomIn 0.8s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default BannerSlider;