"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  StarIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/solid";

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }:any) => { return `${src}?w=${width}&q=${quality || 75}`;};

// --- Types ---
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  review: string;
  rating: number;
  image?: string;
  metric?: string;
}

// Default SalesmanPro Testimonials Data
const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Kimani",
    role: "Founder & CEO",
    company: "Nairobi Chic Boutique",
    review: "SalesmanPro's M-PESA automated STK pushes and POS counter checkout completely eliminated our manual payment tracking. Daily sales balancing that used to take 2 hours now takes under 5 minutes.",
    rating: 5,
    metric: "+140% Monthly Revenue",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "2",
    name: "David Ochieng",
    role: "Operations Lead",
    company: "Apex Electronics Kenya",
    review: "The WhatsApp AI sales agent is a game-changer. Customers ask for stock availability, get instant direct checkout links, and complete orders even while our team is asleep.",
    rating: 5,
    metric: "3x Conversion Rate",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "3",
    name: "Amina Hussein",
    role: "Store Manager",
    company: "Mombasa Fresh Grocers",
    review: "Managing inventory across three branches was chaotic until SalesmanPro. Real-time stock alerts and multi-role staff access gave us total transparency and stopped stock losses completely.",
    rating: 5,
    metric: "0% Inventory Loss",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
  },
];

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

export default function Testimonials({ testimonials = MOCK_TESTIMONIALS }: TestimonialsProps) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const tLength = testimonials.length;

  const activeIndex = Math.abs(page % tLength);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  const currentTestimonial = testimonials[activeIndex];

  return (
    <section className="relative py-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
      
      {/* Background Decorative Glow Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-20">
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-orange-400 to-amber-300 rounded-full blur-[120px] -top-1/4 -left-1/4" />
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-orange-600 to-yellow-500 rounded-full blur-[100px] -bottom-1/4 -right-1/4" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header Block */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-3.5 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/40 inline-flex items-center gap-1.5">
            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
            Customer Success Stories
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Loved By Growing Businesses <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400">
              Across The Region
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Discover how SalesmanPro transforms retail stores, online brands, and multi-location businesses.
          </p>
        </motion.div>

        {/* Dynamic Card Container */}
        <div className="relative max-w-4xl mx-auto min-h-[420px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden"
            >
              {/* Optional Key Metric Badge */}
              {currentTestimonial.metric && (
                <div className="absolute top-6 right-6 sm:top-8 sm:right-8 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-sm">
                  {currentTestimonial.metric}
                </div>
              )}

              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 sm:gap-10">
                
                {/* User Avatar Block */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden p-1 bg-gradient-to-tr from-orange-500 to-amber-400 shadow-xl">
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {currentTestimonial.image ? (
                        <Image
                          src={currentTestimonial.image}
                          alt={currentTestimonial.name}
                          loader={customLoader}
                          fill
                          sizes="(max-width: 768px) 96px, 112px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-orange-600">
                          {currentTestimonial.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mt-3">
                    {[...Array(currentTestimonial.rating || 5)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 text-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Review Body */}
                <div className="flex-1 text-center md:text-left space-y-4">
                  <p className="text-lg sm:text-2xl font-medium leading-relaxed text-slate-800 dark:text-slate-100 italic">
                    "{currentTestimonial.review}"
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      {currentTestimonial.name}
                    </h4>
                    <p className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {currentTestimonial.role} &bull; <span className="text-slate-500 dark:text-slate-400">{currentTestimonial.company}</span>
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Navigation & Pagination Dots */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto px-4">
          
          {/* Pagination Indicators */}
          <div className="flex items-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const newDir = index > activeIndex ? 1 : -1;
                  setPage([index, newDir]);
                }}
                aria-label={`Go to testimonial ${index + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "bg-orange-600 w-8"
                    : "bg-slate-300 dark:bg-slate-700 hover:bg-orange-300 w-2.5"
                }`}
              />
            ))}
          </div>

          {/* Controller Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => paginate(-1)}
              aria-label="Previous Testimonial"
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ArrowLeftIcon className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              onClick={() => paginate(1)}
              aria-label="Next Testimonial"
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ArrowRightIcon className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}