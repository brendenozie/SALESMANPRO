"use client";

import React, { useState } from "react";
import Slider from "react-slick"; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeftIcon, ChevronRightIcon, ArrowUpRightIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { EditableElement } from "@/contexts/EditableContentContext";
import { useVisualEditor } from "@/hooks/useVisualEditor";

// const Slider = dynamic(() => import("react-slick"), {
//   ssr: false,
//   loading: () => (
//     <div className="flex gap-4 overflow-hidden py-4">
//       {[...Array(3)].map((_, i) => (
//         <div key={i} className="min-w-[280px] md:w-1/3 h-[420px] bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem] animate-pulse" />
//       ))}
//     </div>
//   ),
// });

const loaderProp = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width || 800}&q=${quality || 75}`;

const CustomPrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    aria-label="Previous categories"
    type="button"
    className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
  </button>
);

const CustomNextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    aria-label="Next categories"
    type="button"
    className="absolute top-1/2 -right-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-white transition-all group hidden lg:block"
  >
    <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
  </button>
);

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  fashion: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800",
  cars: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800",
  property: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800",
  furniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800",
  restaurant: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800",
  beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800",
  health: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800",
  travel: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800",
  services: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800",
  consulting: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800",
  event: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800",
  booking: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=800",
  finance: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800",
  home: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800",
};

function getCategoryFallbackImage(name: string = ""): string {
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (lower.includes(key)) return url;
  }
  return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800";
}

const CategoryCard = ({ value }: { value: { id: string; name: string; image: string; tags?: string[] } }) => {
  const [imageError, setImageError] = useState(false);
  const fallbackImage = getCategoryFallbackImage(value?.name);
  const rawImage = value?.image;
  const safeImage = !rawImage
    ? fallbackImage
    : (rawImage.startsWith('http://') || rawImage.startsWith('https://') || rawImage.startsWith('/') || rawImage.startsWith('data:'))
      ? rawImage
      : `/${rawImage}`;

  return (
    <Link
      href={`/ghuba/productlist?category=${encodeURIComponent(value.name)}`}
      prefetch={true}
      className="relative group cursor-pointer h-[380px] md:h-[460px] w-full overflow-hidden rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-md block bg-zinc-100 dark:bg-zinc-900"
    >
      <Image decoding="async"
        fill
        src={imageError ? fallbackImage : safeImage}
        alt={value.name}
        sizes="(max-width: 640px) 85vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        onError={() => setImageError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col justify-end space-y-3">
        {value.tags && value.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {value.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-[9px] font-bold uppercase tracking-wider text-white bg-amber-500 px-2.5 py-0.5 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex justify-between items-end gap-3">
          <div>
            <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1">Explore</p>
            <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight">{value.name}</h3>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <ArrowUpRightIcon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
};

const TopCate = ({ categories = [] }: { categories?: any[] }) => {
  const { isEditorMode } = useVisualEditor();
  const router = useRouter();

  const settings = {
    dots: false,
    infinite: categories.length > 3,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: !isEditorMode,
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
    <section className="relative py-10 md:py-16 bg-white dark:bg-[#080808] overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
              <Squares2X2Icon className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <EditableElement
                targetId="ghuba.home.topcate.badge"
                label="Top Categories Badge"
                type="text"
                defaultValue="Curated Collections"
              >
                <span className="text-amber-500 text-[10px] md:text-xs font-black uppercase tracking-wider">Curated Collections</span>
              </EditableElement>
              <EditableElement
                targetId="ghuba.home.topcate.title"
                label="Top Categories Title"
                type="text"
                defaultValue="Top Categories"
              >
                <h2 className="text-2xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">
                  Top <span className="text-amber-500 italic">Categories</span>
                </h2>
              </EditableElement>
            </div>
          </div>

          <EditableElement
            targetId="ghuba.home.topcate.buttonText"
            label="Top Categories Button"
            type="text"
            defaultValue="Catalog"
          >
            <Link
              href="/ghuba/categories"
              prefetch={true}
              className="group flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold uppercase tracking-wider text-xs rounded-xl shadow-md transition-all shrink-0 active:scale-95"
            >
              <span>Catalog</span>
              <ArrowUpRightIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </EditableElement>
        </div>

        <div className="relative">
          <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-none">
            {categories.map((value, index) => (
              <div key={value.id || index} className="snap-start min-w-[82vw] shrink-0">
                <CategoryCard value={value} />
              </div>
            ))}
          </div>

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

export default TopCate;