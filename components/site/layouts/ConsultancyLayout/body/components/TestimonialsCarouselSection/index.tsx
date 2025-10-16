"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "@heroicons/react/24/solid";
import { Testimonial } from "@/types/typings";

const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// interface Testimonial {
//   quote: string;
//   author: string;
//   role?: string;
//   avatarUrl?: string;
//   rating?: number;
// }

interface Props {
  testimonials: Testimonial[];
}

// Animation variants for carousel transitions
const itemVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
      opacity: { duration: 0.3 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      opacity: { duration: 0.2 },
    },
  }),
};

export default function TestimonialsCarouselSection({ testimonials }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  if (!testimonials || testimonials.length === 0) {
    return (
      <section className="py-16 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          No testimonials available at the moment. Be the first to share your experience!
        </p>
      </section>
    );
  }

  // Auto-rotate every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => {
      const newIndex = (prev + newDirection + testimonials.length) % testimonials.length;
      return newIndex;
    });
  };

  return (
    <>
    {/* 5. Testimonials Section */}
<section
  id="testimonials"
  className="relative py-28 bg-gradient-to-br from-white via-orange-50/50 to-orange-100/30 overflow-hidden"
>
  {/* Decorative Glow Elements */}
  <div className="absolute inset-0 pointer-events-none opacity-40">
    <div className="absolute top-10 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
    <div className="absolute bottom-10 right-0 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
  </div>

  <div className="relative container mx-auto px-6">
    {/* Header */}
    <div className="text-center mb-20">
      <span className="text-lg font-semibold text-orange-700 uppercase tracking-wider mb-3 block">
        Voices of Success
      </span>
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
        What My Clients <span className="text-orange-600">Are Saying</span>
      </h2>
      <p className="mt-5 text-xl text-gray-700 max-w-3xl mx-auto">
        Authentic stories from professionals and teams who transformed their performance,
        confidence, and clarity through our sessions.
      </p>
    </div>

    {/* Testimonials Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {[
        {
          quote:
            "Alex’s coaching completely reshaped how I lead. I found clarity, confidence, and courage to navigate major change with impact.",
          name: "Sarah Chen",
          title: "CEO, Tech Innovations",
          image: "/client-sarah.jpg",
        },
        {
          quote:
            "I was uncertain about my career direction, but Alex guided me with practical strategies and emotional insight. I now thrive in my dream role!",
          name: "Michael Rodriguez",
          title: "Product Manager, Global Solutions",
          image: "/client-michael.jpg",
        },
        {
          quote:
            "Our team’s communication and synergy transformed after just two workshops. We’re more united, creative, and productive than ever.",
          name: "Emily White",
          title: "Head of HR, Creative Agency",
          image: "/client-emily.jpg",
        },
      ].map((t, i) => (
        <div
          key={i}
          className="group relative p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-orange-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
        >
          {/* Quotation Mark Accent */}
          <div className="absolute top-4 right-6 text-orange-300 text-6xl font-serif opacity-20 group-hover:opacity-40 transition-opacity">
            “
          </div>

          {/* Client Quote */}
          <p className="text-lg text-gray-800 leading-relaxed mb-8 relative z-10 italic">
            “{t.quote}”
          </p>

          {/* Client Info */}
          <div className="flex items-center gap-4">
            <img
              src={t.image}
              alt={t.name}
              className="w-14 h-14 rounded-full object-cover shadow-md border border-orange-100"
            />
            <div>
              <h4 className="font-bold text-gray-900 text-lg">{t.name}</h4>
              <span className="text-gray-500 text-sm">{t.title}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

    <section className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-200 dark:bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: "-3s" }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-reverse" style={{ animationDelay: "-5s" }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">
            Hear From Our Community! 🌟
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover why our users love us. Real stories from real people.
          </p>
        </motion.div>

        <div className="relative max-w-2xl mx-auto h-[350px] md:h-[300px] flex items-center justify-center">
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
              dragElastic={1}
              onDragEnd={(e: any, { offset, velocity }:any) => {
                const swipePower = Math.abs(offset.x) * velocity.x;
                if (swipePower < -10000) {
                  paginate(1);
                } else if (swipePower > 10000) {
                  paginate(-1);
                }
              }}
              className="absolute w-full px-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl border border-blue-100 dark:border-gray-700 transform hover:scale-[1.01] transition-transform duration-300 ease-out cursor-grab">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  {testimonials[current].avatarUrl && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                      className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 dark:border-blue-400 shadow-md mb-6"
                    >
                      <Image
                        src={testimonials[current].avatarUrl || 'placeholder.com'}
                        alt={testimonials[current].authorName || 'author name'}
                        width={96}
                        height={96}
                        loader={customLoader}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </motion.div>
                  )}

                  {/* Quote */}
                  <p className="text-xl md:text-2xl italic text-gray-800 dark:text-gray-100 mb-6 font-serif leading-relaxed">
                    &ldquo;{testimonials[current].quote}&rdquo;
                  </p>

                  {/* Rating */}
                  {testimonials[current].rating && (
                    <div className="flex justify-center mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-6 h-6 ${
                            i < (testimonials[current].rating ?? 0)
                              ? "text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Author */}
                  <p className="font-bold text-blue-700 dark:text-blue-400 text-lg">
                    {testimonials[current].authorName}
                  </p>
                  {testimonials[current].authorTitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {testimonials[current].authorTitle}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <motion.button
            onClick={() => paginate(-1)}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 z-20 opacity-80 hover:opacity-100 -ml-2 md:-ml-8"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeftIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </motion.button>
          <motion.button
            onClick={() => paginate(1)}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 z-20 opacity-80 hover:opacity-100 -mr-2 md:-mr-8"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRightIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </motion.button>
        </div>

        {/* Dots */}
        <div className="flex justify-center mt-12 gap-3">
          {testimonials.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setDirection(idx > current ? 1 : -1);
                setCurrent(idx);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === current ? "bg-blue-600 w-8" : "bg-gray-300 dark:bg-gray-600"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
