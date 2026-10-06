'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { PlayIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { HeroSlide } from "@/types/typings";
import { EditableElement } from "@/contexts/EditableContentContext";

const loader = ({ src }: { src: string }) => src;

const SLIDE_TIME = 6000;

export interface RestaurantHeroProps {
  config?: {
    variant?: string;
    autoplayIntervalMs?: number;
    slides?: Array<{
      id?: string;
      headline?: string;
      title?: string;
      subline?: string;
      eyebrow?: string;
      description?: string;
      imageUrl?: string;
      ctaText?: string;
      primaryButtonText?: string;
      ctaLink?: string;
      primaryButtonUrl?: string;
      badgeText?: string;
    }>;
    headline?: string;
    subline?: string;
    badgeText?: string;
    ctaText?: string;
    ctaLink?: string;
    imageUrl?: string;
  };
  heroSlides?: any[];
  themeSettings?: any;
  slug?: string;
}

export default function RestaurantHero({
  config,
  heroSlides,
  themeSettings,
}: RestaurantHeroProps) {
  const defaultThemeSlides = [
    {
      id: "1",
      headline: "The Art of Gourmet Dining",
      subline: "Experience an explosion of flavors crafted by world-class chefs in the heart of the city.",
      imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2670",
      ctaText: "Reserve a Table",
      ctaLink: "/restaurent/products",
      badgeText: "Experience Excellence",
    },
    {
      id: "2",
      headline: "Savor Every Moment",
      subline: "From farm to fork, we bring you the freshest seasonal ingredients prepared with passion.",
      imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2670",
      ctaText: "Explore Menu",
      ctaLink: "/restaurent/products",
      badgeText: "Seasonal Specials",
    },
  ];

  // Resolve slides prioritizing structured tenant config -> pageData.heroSlides -> authentic theme defaults
  const configSlides = config?.slides?.length
    ? config.slides.map((s, idx) => ({
        id: s.id || String(idx + 1),
        headline: s.headline || s.title || "The Art of Gourmet Dining",
        subline:
          s.subline ||
          s.eyebrow ||
          s.description ||
          "Experience an explosion of flavors crafted by world-class chefs in the heart of the city.",
        imageUrl:
          s.imageUrl ||
          "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2670",
        ctaText: s.ctaText || s.primaryButtonText || "Reserve a Table",
        ctaLink: s.ctaLink || s.primaryButtonUrl || "/restaurent/products",
        badgeText: s.badgeText || "Experience Excellence",
      }))
    : config?.headline
    ? [
        {
          id: "1",
          headline: config.headline,
          subline:
            config.subline ||
            config.description ||
            "Experience an explosion of flavors crafted by world-class chefs in the heart of the city.",
          imageUrl:
            config.imageUrl ||
            "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2670",
          ctaText: config.ctaText || "Reserve a Table",
          ctaLink: config.ctaLink || "/restaurent/products",
          badgeText: config.badgeText || "Experience Excellence",
        },
      ]
    : null;

  const slides = configSlides || (heroSlides?.length ? heroSlides : defaultThemeSlides);
  const slideInterval = config?.autoplayIntervalMs || SLIDE_TIME;

  const [current, setCurrent] = useState(0);
  const primary = themeSettings?.primaryColor || "#FF5722";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, slideInterval);
    return () => clearInterval(interval);
  }, [slides.length, slideInterval]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-zinc-950">
      
      {/* --- BACKGROUND LAYER (KEN BURNS EFFECT) --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.05, opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image decoding="async"
            src={slides[current].imageUrl}
            alt="Hero Background"
            fill
            priority
            className="object-cover brightness-[0.4] saturate-[0.8]"
          />
          {/* Noise & Texture Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-zinc-950" />
        </motion.div>
      </AnimatePresence>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl"
          >
            {/* Animated Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
              <EditableElement
                targetId={`RestaurantHero.slide${current}.badgeText`}
                componentKey="RestaurantHero"
                elementKey="badgeText"
                label={`Slide ${current + 1} Badge`}
                type="text"
                defaultValue={slides[current].badgeText}
                inline
              >
                {(val) => (
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                    {val ?? slides[current].badgeText}
                  </span>
                )}
              </EditableElement>
            </motion.div>

            {/* Split-Text Style Headline */}
            <EditableElement
              targetId={`RestaurantHero.slide${current}.headline`}
              componentKey="RestaurantHero"
              elementKey="headline"
              label={`Slide ${current + 1} Headline`}
              type="text"
              defaultValue={slides[current].headline}
            >
              {(val) => (
                <motion.h1
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-6xl md:text-9xl font-serif italic text-white leading-[0.9] tracking-tighter mb-8"
                >
                  {(val ?? slides[current].headline).split(' ').map((word: any, i: any) => (
                    <span key={i} className={i % 2 === 1 ? "text-zinc-500" : ""}>
                      {word}{' '}
                    </span>
                  ))}
                </motion.h1>
              )}
            </EditableElement>

            <EditableElement
              targetId={`RestaurantHero.slide${current}.subline`}
              componentKey="RestaurantHero"
              elementKey="subline"
              label={`Slide ${current + 1} Subline`}
              type="textarea"
              defaultValue={slides[current].subline}
            >
              {(val) => (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-zinc-300 max-w-xl font-medium leading-relaxed mb-12"
                >
                  {val ?? slides[current].subline}
                </motion.p>
              )}
            </EditableElement>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-6 items-center"
            >
              <Link
                href={slides[current]?.ctaLink || "/restaurent/products"}
                className="group relative px-10 py-5 rounded-full overflow-hidden bg-white text-zinc-950 transition-transform active:scale-95"
              >
                <div className="relative z-10 flex items-center gap-3 font-black uppercase text-[10px] tracking-widest">
                  <EditableElement
                    targetId={`RestaurantHero.slide${current}.ctaText`}
                    componentKey="RestaurantHero"
                    elementKey="ctaText"
                    label={`Slide ${current + 1} CTA Button`}
                    type="text"
                    defaultValue={slides[current].ctaText}
                    inline
                  >
                    {(val) => <>{val ?? slides[current].ctaText}</>}
                  </EditableElement>
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <button className="flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-zinc-950 transition-all">
                  <PlayIcon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Watch Film</span>
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- SIDE NAVIGATION & PROGRESS --- */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-8 items-center">
        <div className="h-40 w-px bg-white/10 relative">
            <motion.div 
                className="absolute top-0 left-0 w-full bg-white"
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                key={current}
                transition={{ duration: SLIDE_TIME / 1000, ease: "linear" }}
            />
        </div>
        <div className="flex flex-col gap-4">
          {slides.map((_:any, i:any) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`text-xs font-black transition-all ${
                i === current ? "text-white scale-125" : "text-zinc-600 hover:text-white"
              }`}
            >
              0{i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* --- SCROLL INDICATOR --- */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
      >
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
      </motion.div>

    </section>
  );
}