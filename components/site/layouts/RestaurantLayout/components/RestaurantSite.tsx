"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { PlayCircleIcon } from "@heroicons/react/24/solid";
import { HeroSlide } from "@/types/typings";

const loader = ({ src }: { src: string }) => {
  return src;
};

// Fallback slides
const fallbackSlides: HeroSlide[] = [
  {
    id: "1",
    headline: "Mouth-Watering Truffle Pasta",
    subline: "A creamy, decadent pasta dish you won't forget.",
    imageUrl:
      "https://images.unsplash.com/photo-1543360641-f09b2e0e9803?q=80&w=2670&auto=format&fit=crop",
    productImageUrl: "",
    ctaText: "Order Now",
    ctaLink: "/menu/truffle-pasta",
    badgeText: "NEW MENU ITEM",
    companyId: "",
    type: null,
    videoLink: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null,
  },
];

const SLIDE_TIME = 5000;
const TRANSITION = 1.1;

interface Props {
  heroSlides?: HeroSlide[];
  themeSettings?: any;
  slug?: string;
}

export default function RestaurantHero({
  heroSlides,
  themeSettings,
  slug,
}: Props) {
  const slides = heroSlides?.length ? heroSlides : fallbackSlides;

  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(slides.length - 1);

  const primary = themeSettings?.primaryColor || "#FF5722";
  const secondary = themeSettings?.secondaryColor || "#3F51B5";

  const restaurantSlug = slug || "restaurant";

  useEffect(() => {
    const interval = setInterval(() => {
      setPrev(current);
      setCurrent((i) => (i === slides.length - 1 ? 0 : i + 1));
    }, SLIDE_TIME);
    return () => clearInterval(interval);
  }, [current, slides.length]);

  const currentSlide = slides[current];
  const previousSlide = slides[prev];

  const imageClass =
    "object-cover brightness-[0.7] saturate-125 pointer-events-none";

  return (
    <section className="relative h-screen w-full overflow-hidden max-w-[100vw] flex items-center justify-center">

      {/* BACKGROUND IMAGES (Safe Scaled Layers) */}
      <div className="absolute inset-0 overflow-hidden will-change-transform z-0">
        
        {/* Previous slide (fading out) */}
        {previousSlide.id !== currentSlide.id && (
          <motion.div
            key={`${previousSlide.id}-prev`}
            className="absolute inset-0 overflow-hidden will-change-transform"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: TRANSITION, ease: "easeInOut" }}
          >
            <Image
              src={
                previousSlide.imageUrl ||
                previousSlide.productImageUrl ||
                fallbackSlides[0].imageUrl || "https://unsplash.com/source/food/daily?q=80&w=2670&auto=format&fit=crop"
              }
              alt={previousSlide.headline || "Previous slide image"}
              loader={loader}
              fill
              className={imageClass}
              priority={false}
            />
          </motion.div>
        )}

        {/* Current slide (fading in + safe zoom) */}
        <motion.div
          key={currentSlide.id}
          className="absolute inset-0 overflow-hidden will-change-transform"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: TRANSITION, ease: "easeInOut" }}
        >
          <Image
            src={
              currentSlide.imageUrl ||
              currentSlide.productImageUrl ||
              fallbackSlides[0].imageUrl || "https://unsplash.com/source/food/daily?q=80&w=2670&auto=format&fit=crop"
            }
            alt={currentSlide.headline || "Current slide image"}
            loader={loader}
            fill
            className={imageClass}
            priority={true}
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      </div>

      {/* CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentSlide.id}-content`}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 max-w-[90vw] text-center mx-auto px-4"
        >
          {currentSlide.badgeText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow"
              style={{
                backgroundColor: currentSlide.backgroundColor || primary,
                color: currentSlide.textColor || "white",
              }}
            >
              {currentSlide.badgeText}
            </motion.div>
          )}

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-xl mb-4 leading-tight"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            {currentSlide.headline}
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl font-light text-white/90 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            {currentSlide.subline}
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            {currentSlide.ctaLink && (
              <Link
                href={`/${restaurantSlug}${currentSlide.ctaLink}`}
                className="px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition transform hover:scale-[1.03]"
                style={{ background: primary, color: "white" }}
              >
                {currentSlide.ctaText}
              </Link>
            )}

            <Link
              href={`/${restaurantSlug}/menu`}
              className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg shadow-lg bg-white/10 hover:bg-white/30 transition transform hover:scale-[1.03]"
            >
              View Full Menu
            </Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* VIDEO BUTTON */}
      {currentSlide.videoLink && (
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white z-20"
        >
          <PlayCircleIcon className="h-10 w-10" />
          <span className="font-semibold text-lg">Watch Our Story</span>
        </motion.button>
      )}

      {/* DOTS */}
      <div className="absolute bottom-8 right-8 flex gap-2 z-20 max-w-[90vw] overflow-hidden">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setPrev(current);
              setCurrent(i);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              i === current ? "bg-white scale-125" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
