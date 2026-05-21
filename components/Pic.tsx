"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Picard, { picardData } from "./Picard";

export default function Pic() {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Checks scroll positioning constraints to dynamically calibrate button disable state toggles
  const checkScrollPosition = () => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
      setCanScrollLeft(scrollLeft > 2);
      // Give 5px tolerance threshold for scaling/rounding differences in layout engines
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollContainer.current;
    if (el) {
      el.addEventListener("scroll", checkScrollPosition);
      // Check on initial load if screen size fits all cards without scrolling
      checkScrollPosition();
      window.addEventListener("resize", checkScrollPosition);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainer.current) {
      const cardWidthWithGap = 368; // Card width (320px) + Gap (48px / space-x-12)
      scrollContainer.current.scrollBy({
        left: direction === "left" ? -cardWidthWithGap : cardWidthWithGap,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="features" className="relative flex flex-col py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Premium Glassmorphic Mesh Spheres */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-pink-400/20 to-purple-400/0 rounded-full blur-[120px] -top-48 -left-48 animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-bl from-amber-300/10 to-orange-400/0 rounded-full blur-[100px] -bottom-36 right-0" />
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 relative z-10">
        {/* Header Block Header & Orchestrated Layout Controllers */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-3 py-1 rounded-full border border-pink-200/40 dark:border-pink-900/30 inline-block">
                Ecosystem Framework
              </span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Discover Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-red-500 to-amber-500 dark:from-pink-400 dark:via-red-400 dark:to-amber-400">
                  Powerful Features
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Explore a modular suite of tools optimized to stabilize workflow pipelines, accelerate operational velocities, and compound revenue target acquisition scales.
              </p>
            </motion.div>
          </div>

          {/* Interactive Controller Button Suite */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 self-start md:self-auto"
          >
            <button
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={`p-3.5 rounded-xl border transition-all duration-300 ${
                canScrollLeft
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-md shadow-slate-950/5 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95"
                  : "bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 border-slate-200/50 dark:border-slate-800/50 cursor-not-allowed opacity-50"
              }`}
            >
              <ArrowLeftIcon className="h-5 w-5 stroke-[2.5]" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={`p-3.5 rounded-xl border transition-all duration-300 ${
                canScrollRight
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-md shadow-slate-950/5 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95"
                  : "bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 border-slate-200/50 dark:border-slate-800/50 cursor-not-allowed opacity-50"
              }`}
            >
              <ArrowRightIcon className="h-5 w-5 stroke-[2.5]" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Modern Canvas Edge Fade Containers */}
      <div className="relative w-full overflow-visible">
        {/* Left Mask Overlay */}
        <div className="absolute left-0 inset-y-0 w-8 md:w-24 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-950 z-20 pointer-events-none" />
        
        <div
          ref={scrollContainer}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none space-x-12 py-8 px-[max(1.5rem,calc((100vw-80rem)/2))] select-none"
          style={{ scrollbarWidth: "none" }}
        >
          {picardData.map((card) => (
            <div key={card.id} className="flex-shrink-0 snap-center first:pl-4 last:pr-4">
              <Picard
                title={card.title}
                desc={card.desc}
                icon={card.icon}
                gradientClass={card.gradientClass}
              />
            </div>
          ))}
        </div>

        {/* Right Mask Overlay */}
        <div className="absolute right-0 inset-y-0 w-8 md:w-24 bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-950 z-20 pointer-events-none" />
      </div>
    </section>
  );
}