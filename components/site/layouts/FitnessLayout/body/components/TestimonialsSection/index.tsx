"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { Testimonial } from "@/types/typings";

const loader = ({ src }: { src: string }) => src;

const slideVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (direction: number) => ({
    y: direction < 0 ? 40 : -40,
    opacity: 0,
    transition: { duration: 0.4 },
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
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);

  const paginate = (newDirection: number) => {
    setPage(([current]) => [
      (current + newDirection + testimonials.length) % testimonials.length,
      newDirection,
    ]);
  };

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const t = testimonials[page];

  return (
    <section className="relative py-32 bg-[#050505] overflow-hidden">
      {/* Background Stylized "COMMUNITY" Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
        <span className="text-[20vw] font-black text-white/[0.02] leading-none uppercase italic tracking-tighter">
          COMMUNITY
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center">
          {/* Section Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mb-8 flex items-center gap-4"
          >
            <div className="h-[1px] w-8 bg-orange-500" />
            <span className="text-orange-500 font-black tracking-[0.4em] uppercase text-xs">Testimonials</span>
            <div className="h-[1px] w-8 bg-orange-500" />
          </motion.div>

          {/* Large Quotation Mark */}
          <span className="text-orange-500 text-9xl font-black italic leading-none opacity-20 -mb-12">“</span>

          <div className="relative min-h-[400px] w-full flex items-center justify-center">
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
                {/* Huge Typographic Quote */}
                <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-tight mb-12">
                  {t.quote}
                </h2>

                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                   {/* Avatar with Custom Frame */}
                  <div className="relative">
                    <div className="absolute -inset-2 bg-orange-500/20 rounded-full blur-lg" />
                    <Image
                      src={t.avatarUrl || ''}
                      alt={t.authorName || ''}
                      width={80}
                      height={80}
                      className="relative rounded-full grayscale hover:grayscale-0 transition-all duration-500 object-cover border-2 border-orange-500 p-1"
                      loader={loader}
                    />
                  </div>

                  <div className="text-left">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                      {t.authorName}
                    </h3>
                    <p className="text-orange-500 text-xs font-black uppercase tracking-widest">
                      {t.authorTitle}
                    </p>
                    <div className="flex mt-2 gap-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <StarIcon key={i} className="h-3 w-3 text-orange-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Luxury Controls */}
          <div className="mt-20 flex items-center gap-12">
            <button
              onClick={() => paginate(-1)}
              className="group flex items-center gap-4 text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-2 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Prev</span>
            </button>

            {/* Progress Track */}
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-[2px] transition-all duration-500 ${
                    idx === page ? "w-12 bg-orange-500" : "w-4 bg-white/10"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              className="group flex items-center gap-4 text-white/40 hover:text-white transition-colors"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Next</span>
              <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}