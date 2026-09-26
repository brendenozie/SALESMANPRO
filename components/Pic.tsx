"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Picard, { picardData } from "./Picard";

export default function Pic() {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScrollPosition = () => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

      // Estimate active index based on scroll position
      const cardWidth = 360 + 24; // Card width + gap
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(index, 0), picardData.length - 1));
    }
  };

  useEffect(() => {
    const el = scrollContainer.current;
    if (el) {
      el.addEventListener("scroll", checkScrollPosition, { passive: true });
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
      const cardWidthWithGap = 384;
      scrollContainer.current.scrollBy({
        left: direction === "left" ? -cardWidthWithGap : cardWidthWithGap,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="ai-studio"
      className="relative py-28 bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300"
    >
      {/* Background Decorative Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-[160px] pointer-events-none z-0" />

      <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div className="max-w-2xl space-y-4">
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-orange-500/10 dark:bg-orange-400/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 dark:border-orange-400/20">
                <SparklesIcon className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span>SalesmanPro Ecosystem</span>
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]"
            >
              Everything you need to <br />
              <span className="text-orange-600 dark:text-orange-400">
                run & scale modern commerce.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl"
            >
              From POS checkout to automated M-PESA STK pushes and WhatsApp AI agents, streamline every revenue stream from one unified dashboard.
            </motion.p>
          </div>

          {/* Navigation Controls & Counter */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 self-start md:self-auto"
          >
            {/* Slide Index Pill */}
            <div className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hidden sm:block">
              <span className="text-orange-600 dark:text-orange-400">{String(activeIndex + 1).padStart(2, "0")}</span> / {String(picardData.length).padStart(2, "0")}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                  canScrollLeft
                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-500/40 hover:text-orange-600 dark:hover:text-orange-400 hover:scale-[1.03] active:scale-[0.97]"
                    : "bg-slate-100/50 dark:bg-slate-900/30 text-slate-300 dark:text-slate-700 border-slate-200/40 dark:border-slate-800/40 cursor-not-allowed"
                }`}
              >
                <ArrowLeftIcon className="h-5 w-5 stroke-[2.5]" />
              </button>
              <button
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                  canScrollRight
                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-500/40 hover:text-orange-600 dark:hover:text-orange-400 hover:scale-[1.03] active:scale-[0.97]"
                    : "bg-slate-100/50 dark:bg-slate-900/30 text-slate-300 dark:text-slate-700 border-slate-200/40 dark:border-slate-800/40 cursor-not-allowed"
                }`}
              >
                <ArrowRightIcon className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="relative w-full overflow-visible">
        {/* Left Fade Gradient */}
        <div className="absolute left-0 inset-y-0 w-12 md:w-28 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-20 pointer-events-none" />

        <div
          ref={scrollContainer}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-6 py-6 px-[max(1.5rem,calc((100vw-80rem)/2))] select-none"
          style={{ scrollbarWidth: "none" }}
        >
          {picardData.map((card, idx) => (
            <div key={card.id} className="flex-shrink-0 snap-start">
              <Picard
                title={card.title}
                desc={card.desc}
                badge={card.badge}
                icon={card.icon}
                gradientClass={card.gradientClass}
                features={card.features}
                index={idx}
              />
            </div>
          ))}
        </div>

        {/* Right Fade Gradient */}
        <div className="absolute right-0 inset-y-0 w-12 md:w-28 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-20 pointer-events-none" />
      </div>
    </section>
  );
}