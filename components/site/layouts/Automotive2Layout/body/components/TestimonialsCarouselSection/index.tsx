"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import {
  ChatBubbleBottomCenterTextIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { Testimonial } from "@/types/typings";

const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface Props {
  testimonials: Testimonial[];
}

// Animation variants for carousel transitions
const itemVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 250 : -250,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
      opacity: { duration: 0.25 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 250 : -250,
    opacity: 0,
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      opacity: { duration: 0.2 },
    },
  }),
};

/* Background Mesh Pattern */
const GridPattern = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="testimonial-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M0 32L32 0H16L0 16M32 32V16L16 32" stroke="currentColor" strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#testimonial-grid)" />
    </svg>
  </div>
);

export default function TestimonialsCarouselSection({ testimonials }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-rotate every 7 seconds
  useEffect(() => {
    if (!testimonials || testimonials.length === 0) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [testimonials?.length]);

  if (!testimonials || testimonials.length === 0) {
    return (
      <section className="py-20 bg-slate-900 dark:bg-[#080B10] text-center border-t border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
          <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-amber-500" />
          <span>Client Reviews</span>
        </div>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          No commercial reviews available at the moment.
        </p>
      </section>
    );
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => {
      const newIndex = (prev + newDirection + testimonials.length) % testimonials.length;
      return newIndex;
    });
  };

  const activeTestimonial = testimonials[current];

  return (
    <section className="relative py-20 md:py-28 bg-slate-900 dark:bg-[#080B10] text-white border-t border-slate-800 overflow-hidden">
      <GridPattern />

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
            <span>Verified Fleet Operators</span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Commercial <span className="text-amber-500">Trust & Reviews</span>
          </motion.h2>

          <motion.p
            className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Read authentic feedback from logistics directors, yard managers, and fleet owners operating across our network.
          </motion.p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-3xl mx-auto min-h-[380px] md:min-h-[320px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={itemVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(e: React.MouseEvent<HTMLDivElement>, { offset, velocity }: { offset: { x: number }; velocity: number }) => {
                const swipePower = Math.abs(offset.x) * velocity;
                if (swipePower < -10000) {
                  paginate(1);
                } else if (swipePower > 10000) {
                  paginate(-1);
                }
              }}
              className="absolute w-full px-2 sm:px-4 cursor-grab active:cursor-grabbing"
            >
              <div className="bg-slate-800/40 dark:bg-[#0F141C] border border-slate-700/60 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md">
                <div className="flex flex-col items-center text-center">
                  
                  {/* Rating Stars */}
                  {activeTestimonial?.rating && (
                    <div className="flex justify-center gap-1 mb-6">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-5 h-5 ${
                            i < (activeTestimonial.rating ?? 0)
                              ? "text-amber-400"
                              : "text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Quote Statement */}
                  <blockquote className="text-base md:text-xl font-medium text-slate-200 mb-8 leading-relaxed max-w-2xl italic">
                    &ldquo;{activeTestimonial?.quote}&rdquo;
                  </blockquote>

                  {/* Author Details & Avatar */}
                  <div className="flex items-center gap-4 pt-6 border-t border-slate-700/60 w-full justify-center">
                    {activeTestimonial?.avatarUrl && (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/40 shrink-0 bg-slate-900">
                        <Image
                          src={activeTestimonial.avatarUrl}
                          alt={activeTestimonial.authorName || "Author Avatar"}
                          width={48}
                          height={48}
                          loader={customLoader}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}

                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white text-sm uppercase tracking-wide">
                          {activeTestimonial?.authorName}
                        </span>
                        <CheckBadgeIcon className="w-4 h-4 text-amber-500" title="Verified Operator" />
                      </div>
                      
                      {activeTestimonial?.authorTitle && (
                        <p className="text-xs text-amber-400/90 font-semibold uppercase tracking-wider mt-0.5">
                          {activeTestimonial.authorTitle}
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav Buttons */}
          <motion.button
            onClick={() => paginate(-1)}
            aria-label="Previous testimonial"
            className="absolute left-0 sm:-left-6 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 hover:bg-slate-800 transition-all z-20 shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={() => paginate(1)}
            aria-label="Next testimonial"
            className="absolute right-0 sm:-right-6 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 hover:bg-slate-800 transition-all z-20 shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Carousel Indicators / Pagination Dots */}
        <div className="flex justify-center items-center mt-12 gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > current ? 1 : -1);
                setCurrent(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === current
                  ? "bg-amber-500 w-8"
                  : "bg-slate-700 hover:bg-slate-600 w-2"
              }`}
              aria-label={`Go to testimonial slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}