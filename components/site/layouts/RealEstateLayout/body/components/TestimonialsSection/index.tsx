"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion'; // Added useScroll and useTransform for parallax
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid'; // For star ratings

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }:any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for section heading
const headingVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

// Animation variants for individual testimonial cards
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

//──────────────────────────────────────────────────────────────────────────────
// TestimonialsSection
//──────────────────────────────────────────────────────────────────────────────
export default function TestimonialsSection({ testimonials }: any) {
  const carouselRef = useRef(null); // Ref for the scrollable container

  // Optional: Parallax effect for background elements
  const { scrollYProgress } = useScroll({
    target: carouselRef,
    offset: ["start end", "end start"]
  });
  const yText = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const yQuote = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);


  // Handle empty testimonials array gracefully
  if (!testimonials || testimonials.length === 0) {
    return (
      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 py-16 sm:py-24 text-center text-gray-700 dark:text-gray-300">
        <p className="text-xl">No testimonials available at the moment. Be the first to share your experience!</p>
      </section>
    );
  }

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 py-20 sm:py-28 overflow-hidden">
      {/* Background elements for visual interest/parallax */}
      <motion.div
        className="absolute top-1/4 left-10 w-48 h-48 bg-amber-200/20 dark:bg-amber-800/20 rounded-full filter blur-3xl"
        style={{ y: yText }}
      />
      <motion.div
        className="absolute bottom-1/4 right-10 w-64 h-64 bg-emerald-200/20 dark:bg-emerald-800/20 rounded-full filter blur-3xl"
        style={{ y: yQuote }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 text-center mb-16 relative"
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          Hear From Our <span className="text-amber-500 dark:text-amber-400">Happy Clients</span>
          <span className="block w-40 h-1 bg-emerald-600 mx-auto mt-4 rounded-full" /> {/* Accent line */}
        </motion.h2>

        {/* Testimonials Carousel */}
        <div className="relative">
          <motion.div
            ref={carouselRef}
            className="flex space-x-6 pb-6 pt-2 overflow-x-auto snap-x snap-mandatory cursor-grab scrollbar-hide
                       md:overflow-hidden md:justify-center lg:justify-between" // Hide scrollbar, center on larger screens
            drag="x"
            dragConstraints={carouselRef}
            dragElastic={0.1}
            role="region"
            aria-label="Testimonials carousel"
            whileInView="visible"
            initial="hidden"
            viewport={{ once: true, amount: 0.3 }}
          >
            {testimonials.map((t:any, idx:any) => (
              <motion.div
                key={t.author + idx} // Using idx as fallback for unique key if id isn't available
                role="group"
                aria-roledescription="slide" // For accessibility in carousels
                tabIndex={0}
                className="snap-center flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]
                           bg-white dark:bg-gray-850 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300
                           border-t-4 border-emerald-500 dark:border-emerald-400
                           focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
                           flex flex-col items-center text-center"
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -5 }} // Slightly lift and scale on hover
              >
                {t.avatarUrl && (
                  <div className="mx-auto mb-6 w-20 h-20 rounded-full overflow-hidden ring-4 ring-amber-500 dark:ring-amber-400">
                    <Image decoding="async"
                      src={t.avatarUrl || `https://placehold.co/100x100/E0F2F7/0288D1?text=CH}`}
                      alt={`Avatar of ${t.author}`}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                )}
                
                {/* Star Rating */}
                {t.rating && (
                  <div className="flex items-center justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-6 h-6 ${
                          i < t.rating ? "text-amber-400" : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                )}

                <p className="italic text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  “{t.quote}”
                </p>
                <span className="block font-bold text-gray-900 dark:text-gray-50 text-lg">
                  — {t.author}
                </span>
                {t.role && (
                  <span className="block text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {t.role}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}