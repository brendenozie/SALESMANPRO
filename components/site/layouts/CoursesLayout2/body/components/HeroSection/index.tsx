'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence
} from 'framer-motion';
import {
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function MountMoriahGlassHero({ storeFormData }: any) {
  const containerRef = useRef(null);

  const heroSlides = storeFormData?.heroSlides || [];
  const [activeIndex, setActiveIndex] = useState(0);

  const activeSlide = heroSlides[activeIndex] || {};

  const primaryColor =
    storeFormData?.themeSettings?.primaryColor || '#1e40af';

  const headline =
    activeSlide?.headline ||
    "The future is exceptionally bright.";

  const subline =
    activeSlide?.subline ||
    "Mount Moriah International combines world-class pedagogy with values-based learning to prepare your child for a global stage.";

  const bannerImg =
    activeSlide?.imageUrl ||
    "https://images.unsplash.com/photo-1541339907198-e08756ebafe3";

  const badgeText = activeSlide?.badge || "Admissions Open 2026";

  /* ---------------------------------
     HEADLINE SPLIT LOGIC (SMART)
  -----------------------------------*/
  const { lineOne, lineTwo } = useMemo(() => {
    if (!headline) return { lineOne: "", lineTwo: "" };

    // Split by first period if exists
    if (headline.includes(".")) {
      const parts = headline.split(".");
      return {
        lineOne: parts[0],
        lineTwo: parts.slice(1).join(".").trim()
      };
    }

    // Otherwise split by word midpoint
    const words = headline.split(" ");
    const midpoint = Math.ceil(words.length / 2);

    return {
      lineOne: words.slice(0, midpoint).join(" "),
      lineTwo: words.slice(midpoint).join(" ")
    };
  }, [headline]);

  /* ---------------------------------
     AUTO SLIDE ROTATION
  -----------------------------------*/
  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex(prev =>
        prev === heroSlides.length - 1 ? 0 : prev + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  /* ---------------------------------
     SCROLL PARALLAX
  -----------------------------------*/
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const smoothImageY = useSpring(imageY, {
    stiffness: 100,
    damping: 30
  });

  /* ---------------------------------
     GLASS CARD SYNC
  -----------------------------------*/
  const glassCard = activeSlide?.glassCard || {
    label: "Environment",
    title: "Safe & Secure",
    icon: "shield"
  };

  const iconMap: any = {
    shield: ShieldCheckIcon,
    academic: AcademicCapIcon,
    community: UserGroupIcon
  };

  const GlassIcon = iconMap[glassCard.icon] || ShieldCheckIcon;

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full bg-white flex items-center overflow-hidden"
    >
      {/* Background blur gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-slate-50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full bg-blue-50/50 blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 xl:gap-24">

          {/* LEFT */}
          <div className="w-full lg:w-1/2">
            <div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100/50 border border-slate-200/60 rounded-full mb-8">
                <SparklesIcon className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                  {badgeText}
                </span>
              </div>

              {/* Headline */}
              <AnimatePresence mode="wait">
                <motion.h1
                  key={headline}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                  className="text-6xl md:text-8xl font-light text-slate-900 leading-[1.05] tracking-tight mb-8"
                >
                  {lineOne}
                  <br />
                  <span className="font-medium">
                    {lineTwo}
                  </span>
                </motion.h1>
              </AnimatePresence>

              {/* Subline */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={subline}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                  className="text-xl text-slate-500 max-w-lg mb-12 leading-relaxed font-normal"
                >
                  {subline}
                </motion.p>
              </AnimatePresence>

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-5 rounded-full bg-slate-900 text-white font-semibold text-sm shadow-xl shadow-slate-200 flex items-center gap-3"
                >
                  Enroll Today
                  <ArrowRightIcon className="w-4 h-4" />
                </motion.button>

                <button className="group flex items-center gap-2 text-sm font-semibold text-blue-600">
                  Take a virtual tour
                  <ChevronDownIcon className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative aspect-square">

              {/* Image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={bannerImg}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8 }}
                  style={{ y: smoothImageY }}
                  className="absolute inset-0 z-10 rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-white"
                >
                  <Image
                    src={bannerImg || "https://images.unsplash.com/photo-1541339907198-e08756ebafe3"}
                    alt={headline}
                    loader={({src})=>src}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Glass Card */}
              <motion.div
                key={glassCard.title}
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -left-12 bottom-12 z-20 bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 w-56"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <GlassIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {glassCard.label}
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {glassCard.title}
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20">
        <ChevronDownIcon className="w-6 h-6 animate-bounce text-slate-400" />
      </div>
    </section>
  );
}