"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { useStoreContext } from "@/contexts/StoreContext";
import { Testimonial } from "@/types/typings";

const loader = ({ src }: { src: string }) => src;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    transition: { duration: 0.3 },
  }),
};

const dummyTestimonials: Testimonial[] = [
  {
    id: "test1",
    quote: "THE BEST DECISION FOR MY FITNESS JOURNEY. THE ELITE TRAINERS AND CURATED COMMUNITY KEEP ME AT PEAK PERFORMANCE EVERY SINGLE DAY.",
    authorName: "SARAH CHEN",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2000",
    authorTitle: "MARKETING DIRECTOR",
    rating: 5,
  },
  {
    id: "test2",
    quote: "FLEXIBILITY MEETS EXPERTISE. THE VIRTUAL INFRASTRUCTURE IS THE ONLY SYSTEM THAT ALLOWS ME TO REMAIN CONSISTENT WITH MY SCALE.",
    authorName: "DAVID KIM",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000",
    authorTitle: "TECH FOUNDER",
    rating: 5,
  },
];

export default function TestimonialsSection({
  testimonials = dummyTestimonials,
}: {
  testimonials?: Testimonial[];
}) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);

  const paginate = (newDirection: number) => {
    setPage(([current]) => [
      (current + newDirection + testimonials.length) % testimonials.length,
      newDirection,
    ]);
  };

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => paginate(1), 8000);
    return () => clearInterval(timer);
  }, [testimonials.length, page]);

  const t = testimonials[page] || dummyTestimonials[0];

  return (
    <section className="relative py-24 sm:py-32 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200/60 dark:border-neutral-900/40 transition-colors duration-500 overflow-hidden">
      {/* Background Stylized Large Watermark Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.02] dark:opacity-[0.03] transition-opacity duration-500">
        <span className="text-[18vw] font-black leading-none uppercase italic tracking-tighter text-neutral-900 dark:text-white">
          COMMUNITY
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center">
          
          {/* Section Indicator */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 flex items-center gap-4"
          >
            <div className="h-[1px] w-6 opacity-60" style={{ backgroundColor: primaryColor }} />
            <span className="font-black tracking-[0.35em] uppercase text-xs" style={{ color: primaryColor }}>
              Testimonials
            </span>
            <div className="h-[1px] w-6 opacity-60" style={{ backgroundColor: primaryColor }} />
          </motion.div>

          {/* Large Structural Quotation Icon Markup */}
          <span className="text-7xl sm:text-9xl font-black italic leading-none opacity-10 dark:opacity-20 select-none -mb-6 sm:-mb-10" style={{ color: primaryColor }}>
            “
          </span>

          {/* Main Context Stage Slider Wrapper */}
          <div className="relative min-h-[460px] sm:min-h-[380px] md:min-h-[340px] w-full flex items-center justify-center px-2 sm:px-6">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col items-center text-center max-w-4xl"
              >
                {/* Large Responsive Quote Title */}
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-neutral-900 dark:text-white italic tracking-tighter uppercase leading-snug sm:leading-tight mb-10 transition-colors">
                  {t.quote}
                </h2>

                {/* Author Card Stack Block */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  {/* Avatar Container with Active Frame Ring Glow */}
                  <div className="relative shrink-0">
                    <div 
                      className="absolute -inset-1.5 rounded-full blur opacity-25 dark:opacity-40 transition-opacity"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <Image decoding="async"
                      src={t.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2000'}
                      alt={t.authorName || 'User Avatar'}
                      width={70}
                      height={70}
                      className="relative rounded-full grayscale hover:grayscale-0 transition-all duration-500 object-cover p-0.5 bg-white dark:bg-neutral-900 border-2"
                      style={{ borderColor: primaryColor }}
                    />
                  </div>

                  <div className="text-center sm:text-left space-y-0.5">
                    <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter transition-colors">
                      {t.authorName}
                    </h3>
                    <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                      {t.authorTitle}
                    </p>
                    
                    {/* Inline Star Rating Render Module */}
                    <div className="flex justify-center sm:justify-start mt-1.5 gap-0.5">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <StarIcon key={i} className="h-3 w-3" style={{ color: primaryColor }} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Premium Interface Audio-Style Track Navigation Controls */}
          <div className="mt-12 flex items-center gap-8 sm:gap-12">
            <button
              onClick={() => paginate(-1)}
              className="group flex items-center gap-3 text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-white transition-colors"
              aria-label="Previous Testimonial"
            >
              <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] hidden sm:inline">Prev</span>
            </button>

            {/* Dynamic Sliding Micro Progress Elements */}
            <div className="flex gap-2 items-center">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const dir = idx > page ? 1 : -1;
                    setPage([idx, dir]);
                  }}
                  className="py-2 focus:outline-none"
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <div
                    className="h-[3px] rounded-full transition-all duration-500"
                    style={{ 
                      width: idx === page ? "40px" : "12px",
                      backgroundColor: idx === page ? primaryColor : "rgba(128,128,128,0.2)" 
                    }}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              className="group flex items-center gap-3 text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-white transition-colors"
              aria-label="Next Testimonial"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] hidden sm:inline">Next</span>
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          
        </div>
      </div>
    </section>
  );
}