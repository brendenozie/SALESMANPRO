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
import { EditableElement } from "@/contexts/EditableContentContext";
import { useVisualEditor } from "@/hooks/useVisualEditor";

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
  if (!categories || categories.length === 0) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4 px-2 sm:px-4 py-3 md:py-4">
      {categories?.map(({ name, icon }: any, index: number) => (
        <Link
          key={index}
          href={`/ghuba/productlist?category=${encodeURIComponent(name)}`}
          prefetch={true}
          className="group relative flex flex-col items-center justify-center p-3 sm:p-4 md:p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 active:scale-95 text-center"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700/60 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
            <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{icon}</span>
          </div>
          <p className="mt-2 font-bold text-center text-[10px] sm:text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-300 group-hover:text-amber-500 transition-colors line-clamp-1">
            {name}
          </p>
        </Link>
      ))}
    </div>
  );
};

// --- REFINED SLIDE CARD (UPDATED WITH NEW DATA STRUCTURE) ---
const SlideCard = ({ slide, isPriority, index = 0 }: any) => {
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
          <EditableElement
            targetId={`ghuba.home.hero.slides.${index}.imageUrl`}
            label={`Slide ${index + 1} Background`}
            type="image"
            defaultValue={slide.imageUrl || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop'}
          >
            <Image decoding="async"
              src={slide.imageUrl || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop'}
              fill
              alt={slide.headline || "Background"}
              priority={isPriority}
              sizes="100vw"
              quality={60}
              className="object-cover opacity-20 dark:opacity-30 grayscale group-hover:scale-105 transition-transform duration-[10s] min-h-[500px] md:min-h-[600px] h-[500px] md:h-[600px]"
            />
          </EditableElement>
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/50 via-zinc-50/80 to-zinc-50 dark:from-black/50 dark:via-black/80 dark:to-black pointer-events-none" />
        </div>

        {/* Content */}
        <div className="relative z-20 w-full md:w-1/2 p-8 sm:p-12 md:p-24 flex flex-col justify-center order-2 md:order-1">
          
          <EditableElement
            targetId={`ghuba.home.hero.slides.${index}.badgeText`}
            label={`Slide ${index + 1} Badge`}
            type="text"
            defaultValue={slide.badgeText || "Exclusive Deal"}
          >
            <div className={`${!isPriority ? 'animate-fade-in-up' : ''} flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full w-fit mb-6`}>
              <SparklesIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
              <span className="text-amber-600 dark:text-amber-500 text-[9px] font-black uppercase tracking-[0.2em]">
                {slide.badgeText || "Exclusive Deal"}
              </span>
            </div>
          </EditableElement>

          <EditableElement
            targetId={`ghuba.home.hero.slides.${index}.headline`}
            label={`Slide ${index + 1} Headline`}
            type="text"
            defaultValue={slide.headline}
          >
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase leading-[0.9] text-zinc-900 dark:text-white tracking-tighter mb-6 transition-colors whitespace-pre-line">
              {slide.headline}
            </h2>
          </EditableElement>

          <EditableElement
            targetId={`ghuba.home.hero.slides.${index}.subline`}
            label={`Slide ${index + 1} Subline`}
            type="textarea"
            defaultValue={slide.subline}
          >
            <p className="text-sm sm:text-lg text-zinc-600 dark:text-zinc-400 font-medium max-w-sm leading-relaxed mb-8 transition-colors">
              {slide.subline}
            </p>
          </EditableElement>

          <div className={`flex flex-wrap items-center gap-6 ${!isPriority ? 'animate-fade-in-up' : ''}`}>
            <EditableElement
              targetId={`ghuba.home.hero.slides.${index}.ctaText`}
              label={`Slide ${index + 1} CTA`}
              type="text"
              defaultValue={slide.ctaText || "Shop Now"}
            >
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
                  router.push(slide.ctaLink || '/ghuba/productlist');
                }}
                className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-transform duration-300"
              >
                <span>{slide.ctaText || "Shop Now"}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </EditableElement>
            
            {/* Added Price rendering from new structure */}
            {slide.price && (
              <EditableElement
                targetId={`ghuba.home.hero.slides.${index}.price`}
                label={`Slide ${index + 1} Price`}
                type="text"
                defaultValue={slide.price}
              >
                <span className="text-zinc-900 dark:text-white font-black text-xl tracking-tight">
                  {slide.price}
                </span>
              </EditableElement>
            )}
          </div>
        </div>

        {/* Image Display */}
        <div className={`${!isPriority ? 'animate-zoom-in' : ''} relative z-10 w-full md:w-1/2 h-[250px] sm:h-[300px] md:h-full flex justify-center items-center order-1 md:order-2 p-6 md:p-12`}>
          <EditableElement
            targetId={`ghuba.home.hero.slides.${index}.productImageUrl`}
            label={`Slide ${index + 1} Product Image`}
            type="image"
            defaultValue={slide.productImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop'}
          >
            <div className="relative w-full h-full max-w-[300px] md:max-w-none group-hover:drop-shadow-[0_0_50px_rgba(245,158,11,0.15)] transition-all duration-700 min-h-[250px] sm:min-h-[300px] md:min-h-[400px]">
              <Image decoding="async"
                src={slide.productImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop'}
                alt={slide.headline || "Product Image"}
                fill
                priority={isPriority}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] min-h-[250px] sm:min-h-[300px] md:min-h-[400px] h-[250px] sm:h-[300px] md:h-[400px] transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </EditableElement>
        </div>
      </div>
    </div>
  );
};

const sampleSlides = [
  {
    id: "nairobi-fashion",
    headline: "TRENDING\nFASHION.",
    badgeText: "Verified Stores / 2026 Collection",
    subline:
      "Explore top-rated sneakers, leather boots, and authentic apparel from trusted Nairobi merchant stores.",
    ctaText: "Shop Fashion",
    ctaLink: "/ghuba/productlist?category=Fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    productImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
    price: "From KES 3,500",
  },
  {
    id: "tech-audio",
    headline: "AUDIO &\nGADGETS.",
    badgeText: "Noise-Cancelling / Same-Day Dispatch",
    subline:
      "Premium Bluetooth headphones, portable wireless speakers, and essential accessories with verified M-Pesa protection.",
    ctaText: "Explore Audio",
    ctaLink: "/ghuba/productlist?category=Music",
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
    productImageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
    price: "From KES 2,500",
  },
  {
    id: "nairobi-living",
    headline: "MODERN\nFURNITURE.",
    badgeText: "Living Essentials / Nairobi Delivery",
    subline:
      "Handcrafted solid oak tables, velvet accent chairs, and living room furniture from vetted local workshops.",
    ctaText: "Discover Furniture",
    ctaLink: "/ghuba/productlist?category=Furniture",
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop",
    productImageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop",
    price: "From KES 8,500",
  },
];

// --- MAIN SECTION ---
const BannerSlider = ({ categories = [], pageData }: { categories: any[], pageData: any }) => {
  const { isEditorMode } = useVisualEditor();
  const heroSlides = pageData?.heroSlides || [];

  const promoSlides = useMemo(() => {
    if (!heroSlides || heroSlides.length === 0) return sampleSlides;
    return heroSlides;
  }, [heroSlides]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: !isEditorMode,
    autoplaySpeed: 5000,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    appendDots: (dots: any) => <div style={{ bottom: "40px" }} className="custom-dots">{dots}</div>,
  };

  return (
    <>
      <section className="bg-white dark:bg-[#080808] pt-4 pb-8 md:pb-12">
        <div className="max-w-[1600px] mx-auto px-4">
          
          {/* 1. Hero Promo Slider - Top Placement for Immediate Engagement & LCP */}
          <div className="mb-8 md:mb-12">
            <Slider {...settings}>
              {promoSlides.map((slide: any, index: number) => (
                <SlideCard 
                  key={slide.id || index} 
                  slide={slide} 
                  index={index}
                  isPriority={index === 0} // Highest priority for LCP
                />
              ))}
            </Slider>
          </div>

          {/* 2. Category Quick Discovery - Clean Section Header & Grid */}
          <div className="pt-2">
            <div className="flex items-center justify-between px-2 sm:px-4 mb-3">
              <div>
                <span className="text-amber-600 dark:text-amber-500 font-bold uppercase text-[10px] md:text-xs tracking-widest block">
                  Marketplace Hub
                </span>
                <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                  Popular <span className="text-amber-500 italic">Categories</span>
                </h2>
              </div>
              <Link
                href="/ghuba/categories"
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline uppercase tracking-wider flex items-center gap-1"
              >
                <span>All Categories</span>
                <span>→</span>
              </Link>
            </div>

            <CategoriesGrid categories={categories} />
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