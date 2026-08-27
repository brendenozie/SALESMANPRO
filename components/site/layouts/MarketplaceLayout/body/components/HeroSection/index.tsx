"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { StoreForm } from "@/types/typings";

// Loader remains the same
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export interface HeroBannerProps {
  storeFormData: StoreForm | null;
}

// Fallback slides (same as HeroSlider)
const defaultSlides = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    headline: "STEP INTO STYLE & COMFORT",
    subline: "Shoes",
    badgeText:
      "Out too the been like hard off. Improve enquire welcome own beloved matters her.",
    ctaText: "Buy Now",
    ctaLink: "/shop",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    headline: "ELEVATE YOUR LOOK TODAY",
    subline: "Awesome",
    badgeText: "Discover fresh drops and timeless classics. Comfort and style perfectly combined.",
    ctaText: "Shop Now",
    ctaLink: "/collection",
  },
];

export default function HeroBanner({ storeFormData }: HeroBannerProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    const { clientWidth, scrollLeft } = carouselRef.current;
    const offset = dir === "left" ? -clientWidth : clientWidth;
    carouselRef.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
  };

  // Normalize heroSlides with fallbacks
  const slides =
    storeFormData?.heroSlides && storeFormData.heroSlides.length > 0
      ? storeFormData.heroSlides.map((s, idx) => ({
          id: idx.toString(),
          imageUrl: s.imageUrl || defaultSlides[idx % defaultSlides.length].imageUrl,
          headline: s.headline || defaultSlides[idx % defaultSlides.length].headline,
          subline: s.subline || defaultSlides[idx % defaultSlides.length].subline,
          badgeText: (s as any).badgeText || defaultSlides[idx % defaultSlides.length].badgeText,
          ctaText: s.ctaText || defaultSlides[idx % defaultSlides.length].ctaText,
          ctaLink: s.ctaLink || defaultSlides[idx % defaultSlides.length].ctaLink,
        }))
      : defaultSlides.map((s, idx) => ({ ...s, id: idx.toString() }));

  return (
    <section className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-[600px] sm:h-[700px]">
        <Image
          src={slides[0].imageUrl}
          alt={slides[0].headline}
          fill
          className="object-cover"
          loader={loader}
        />

        {/* Gradient Shapes */}
        <motion.div
          className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full filter blur-3xl opacity-50"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500 to-red-400 rounded-full filter blur-2xl opacity-40"
          animate={{ y: [0, 30, 0], x: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
        />

        {/* Text Overlay */}
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6">
          <motion.h1
            className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-white uppercase tracking-wide"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {slides[0].headline}
          </motion.h1>
          <motion.p
            className="mt-4 text-lg sm:text-2xl text-gray-200 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {slides[0].badgeText}
          </motion.p>
          <motion.div
            className="mt-8 flex space-x-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <Link
              href={slides[0].ctaLink}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-lg font-semibold shadow-xl hover:scale-105 transition"
            >
              {slides[0].ctaText}
            </Link>
            <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-full text-lg font-medium hover:bg-white hover:text-black transition">
              Learn More
            </button>
          </motion.div>
        </div>
      </div>

      {/* Product Carousel */}
      {slides.length > 1 && (
        <div className="mt-12 relative">
          <button
            onClick={() => scroll("left")}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg z-10 transition"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg z-10 transition"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-800" />
          </button>

          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory space-x-6 px-8 py-8 scrollbar-hide"
          >
            {slides.map((s) => (
              <motion.div
                key={s.id}
                className="min-w-[220px] snap-center bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-2xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={s.imageUrl}
                  alt={s.headline}
                  width={240}
                  height={160}
                  className="object-cover"
                  loader={loader}
                />
                <div className="p-4 text-center bg-gray-50">
                  <h3 className="font-semibold text-lg mb-2">{s.headline}</h3>
                  <Link
                    href={s.ctaLink}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    {s.ctaText}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
