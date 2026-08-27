'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLongRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';

interface FarmChapter {
  tag: string;
  badgeText: string;
  headline: string;
  subline: string;
  image: string;
  imageUrl?: string;
  productImageUrl?: string;
  stats: Record<string, string>;
  ctaText: string;
  ctaLink: string;
}

export interface ImmersiveHeroProps {
  heroSlides?: FarmChapter[] | null;
  themeSettings?: {
    primaryColor?: string;
  };
}

export default function TuyiaFarmImmersiveHero({ heroSlides, themeSettings }: ImmersiveHeroProps) {
  const [active, setActive] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const defaultChapters: FarmChapter[] = useMemo(() => [
    {
      tag: "The Origin",
      badgeText: "The Origin",
      headline: "Tuyia $ Highlands",
      subline: "Nestled in the lush valleys of Laikipia, where the air is crisp and the pastures are endless. This is where the story begins.",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000",
      imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000",
      productImageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
      stats: { elevation: "2,100m", rainfall: "950mm" },
      ctaText: "Explore the Harvest",
      ctaLink: "/shop",
    },
    {
      tag: "The Ethics",
      badgeText: "The Ethics",
      headline: "Pasture $ Raised",
      subline: "Our livestock roams free, grazing on organic clover and Kikuyu grass. No shortcuts, no hormones—just nature's pace.",
      image: "https://images.unsplash.com/photo-1544965838-54ef8406f868?auto=format&fit=crop&q=80&w=2000",
      imageUrl: "https://images.unsplash.com/photo-1544965838-54ef8406f868?auto=format&fit=crop&q=80&w=2000",
      productImageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
      stats: { roaming: "Free", diet: "100% Grass" },
      ctaText: "Explore the Harvest",
      ctaLink: "/meatecommerce/products",
    },
    {
      tag: "The Craft",
      badgeText: "The Craft",
      headline: "Master $ Butchery",
      subline: "Every cut is hand-selected and dry-aged in our Himalayan salt cellar for unparalleled depth of flavor.",
      image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
      imageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
      productImageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
      stats: { aging: "28 Days", grade: "Premium" },
      ctaText: "Explore the Harvest",
      ctaLink: "/meatecommerce/products",
    },
  ], []);

  const slides = useMemo(() => {
    return heroSlides && heroSlides.length > 0 ? heroSlides : defaultChapters;
  }, [heroSlides, defaultChapters]);

  const currentSlide = slides[active] || defaultChapters[0];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window === 'undefined') return;
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 15,
      y: (e.clientY / window.innerHeight - 0.5) * 15,
    });
  };

  const watermarkText = currentSlide?.headline ? currentSlide.headline.split('$')[0].trim() : "Pristine";
  const headlineWords = currentSlide?.headline ? currentSlide.headline.split('$') : ["Pasture", "Raised"];
  const primaryColor = themeSettings?.primaryColor || '#DC2626';

  return (
    <section 
      onMouseMove={handleMouseMove}
      /* Added top padding (pt-28 to pt-36) to clear floating navbar */
      className="relative min-h-screen w-full bg-[#080807] overflow-hidden flex flex-col justify-between pt-28 sm:pt-32 md:pt-36 lg:pt-32 pb-12 lg:pb-16 select-none"
    >
      {/* BACKGROUND TYPOGRAPHY */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-10">
        <motion.h1 
          animate={{ x: mousePos.x * -0.5, y: mousePos.y * -0.5 }}
          transition={{ type: 'easeOut', duration: 0.5 }}
          className="text-[35vw] md:text-[30vw] lg:text-[25vw] font-black text-white/[0.02] uppercase leading-none tracking-tighter whitespace-nowrap will-change-transform"
        >
          {watermarkText}
        </motion.h1>
      </div>

      {/* DYNAMIC IMAGE CANVAS */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.6, scale: 1.02, x: mousePos.x, y: mousePos.y }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 will-change-transform"
          >
            <Image 
              src={currentSlide?.image || currentSlide?.productImageUrl || currentSlide?.imageUrl || defaultChapters[0].image} 
              alt={currentSlide?.headline || "Hero Canvas"}
              loader={({ src }) => src}
              fill 
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-[#080807]/50 to-[#080807]/70" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* MAIN GRAPH CONTENT */}
      <div className="relative z-30 container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 my-auto">
        <div className="max-w-4xl lg:max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="bg-black/30 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-6 sm:p-8 lg:p-0 rounded-3xl lg:rounded-none border border-white/5 lg:border-none shadow-2xl lg:shadow-none"
            >
              {/* Tagline Badge */}
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="h-[2px] w-8 sm:w-10" style={{ backgroundColor: primaryColor }} />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]" style={{ color: primaryColor }}>
                  {currentSlide?.tag || currentSlide?.badgeText || 'Exclusive'}
                </span>
              </div>

              {/* Editorial Headline - Smooth font scaling */}
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7.5rem] font-black text-white leading-[0.95] sm:leading-[0.88] tracking-tighter mb-4 sm:mb-6 lg:mb-8 uppercase break-words">
                {headlineWords.map((word, i) => (
                  <span key={i} className="block overflow-hidden">
                    <motion.span 
                      initial={{ y: "100%" }} 
                      animate={{ y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className={`block ${i === 1 ? "text-transparent italic font-serif" : ""}`}
                      style={i === 1 ? { WebkitTextStroke: '1px rgba(255,255,255,0.4)' } : {}}
                    >
                      {word.trim()}
                    </motion.span>
                  </span>
                ))}
              </h2>

              <p className="text-stone-300 text-sm sm:text-base md:text-lg lg:text-xl max-w-xl mb-8 sm:mb-10 font-medium leading-relaxed opacity-90">
                {currentSlide?.subline}
              </p>

              {/* Actions & Metrics Layer */}
              <div className="flex flex-col sm:flex-row lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-start sm:items-center">
                <Link
                  href={currentSlide?.ctaLink || '/shop'}
                  className="group relative w-full sm:w-auto flex items-center justify-center gap-4 sm:gap-6 bg-white px-8 sm:px-10 py-4 sm:py-5 rounded-full overflow-hidden transition-all active:scale-95 shadow-lg"
                >
                  <span className="relative z-10 text-black font-black text-xs uppercase tracking-widest group-hover:text-white transition-colors duration-300">
                    {currentSlide?.ctaText || "Explore More"}
                  </span>
                  <ArrowLongRightIcon className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 text-black group-hover:translate-x-2 group-hover:text-white transition-all duration-300" />
                  <div 
                    className="absolute inset-0 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out" 
                    style={{ backgroundColor: primaryColor }}
                  />
                </Link>

                <div className="flex gap-8 sm:gap-12 border-t sm:border-t-0 sm:border-l border-white/10 pt-6 sm:pt-0 sm:pl-8 lg:pl-12 w-full sm:w-auto">
                  {Object.entries(currentSlide?.stats || { elevation: "2,100m", rainfall: "950mm" }).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: primaryColor }}>
                        {key}
                      </span>
                      <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white italic tracking-tighter">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* TIMELINE INDICATORS - Safely anchored near bottom without overlapping content */}
      {slides.length > 1 && (
        <div className="relative z-40 container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 pt-8">
          <div className="flex items-center gap-3">
            {slides.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActive(i)}
                className="group py-2 focus:outline-none"
                aria-label={`Go to slide ${i + 1}`}
              >
                <div 
                  className="transition-all duration-500 rounded-full h-[3px]" 
                  style={{
                    width: active === i ? '40px' : '16px',
                    backgroundColor: active === i ? primaryColor : 'rgba(255,255,255,0.2)'
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}