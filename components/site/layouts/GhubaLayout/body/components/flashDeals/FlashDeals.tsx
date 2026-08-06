"use client";

import React, { useState, useCallback } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  BoltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import GhubaProductCard from "../GhubaProductCard";
import dynamic from "next/dynamic";

interface Product {
  id: string | number;
  [key: string]: any;
}

interface FlashDealsProps {
  productItems?: Product[];
  addToCart: (product: Product) => void;
}

const Slider = dynamic(() => import("react-slick"), {
  ssr: false,
  loading: () => (
    <div className="flex gap-4 overflow-hidden py-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-full md:w-1/4 h-[380px] bg-zinc-200 dark:bg-zinc-800/60 rounded-3xl animate-pulse shrink-0"
        />
      ))}
    </div>
  ),
});

const CustomPrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    type="button"
    aria-label="Previous deals"
    className="absolute top-1/2 -left-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 p-3 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-white transition-all group hidden md:block"
  >
    <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
  </button>
);

const CustomNextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    type="button"
    aria-label="Next deals"
    className="absolute top-1/2 -right-4 z-20 -translate-y-1/2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 p-3 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-white transition-all group hidden md:block"
  >
    <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
  </button>
);

const FlashDeals: React.FC<FlashDealsProps> = ({
  productItems = [],
  addToCart,
}) => {
  const router = useRouter();
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  const toggleLike = useCallback((id: string) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: productItems.length > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    swipeToSlide: true,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
    ],
  };

  if (!productItems.length) return null;

  return (
    <section className="py-10 md:py-16 bg-zinc-50 dark:bg-[#0a0a0a] transition-colors duration-300 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500 flex items-center justify-center rounded-2xl shadow-lg shadow-amber-500/20 shrink-0 animate-pulse">
              <BoltIcon className="text-white h-6 w-6 md:h-8 md:w-8" />
            </div>

            <div className="flex flex-col">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">
                Flash <span className="text-amber-500 italic">Deals</span>
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                <ClockIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  Ends in:{" "}
                  <strong className="text-zinc-900 dark:text-zinc-200">
                    12h 45m 02s
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/ghuba/productlist")}
            className="group flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-md transition-all shrink-0"
          >
            <span>View All</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="relative">
          {/* Mobile Hardware-Accelerated Native Snap Carousel */}
          <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-4 pt-1 -mx-4 px-4 scrollbar-none touch-pan-x touch-pan-y">
            {productItems.map((product, index) => (
              <div
                key={product.id || index}
                className="snap-start w-[260px] shrink-0"
              >
                <GhubaProductCard
                  product={product}
                  toggleLike={toggleLike}
                  likedItems={likedItems}
                  addToCart={addToCart}
                />
              </div>
            ))}
          </div>

          {/* Desktop Responsive Carousel */}
          <div className="hidden md:block">
            <Slider {...sliderSettings}>
              {productItems.map((product, index) => (
                <div key={product.id || index} className="px-2.5 py-2">
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
        </div>
      </div>
    </section>
  );
};

export default FlashDeals;