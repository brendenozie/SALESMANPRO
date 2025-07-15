"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image"; // Assuming you have Image component from Next.js
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "@heroicons/react/24/solid"; // More modern chevron icons & Star icon

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface Testimonial {
  quote: string;
  author: string;
  title: string; // Added title for author for more context
  avatarUrl: string;
  rating: number; // Added rating for a more comprehensive testimonial
}

// --- Dummy Data for Testimonials (Replace with your actual data) ---
const dummyTestimonials: Testimonial[] = [
  {
    quote: "Finding my dream car was never this easy! The filters are precise, and the virtual tours are a game-changer. Absolutely seamless experience.",
    author: "Jane Doe",
    title: "Happy Car Buyer",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29329?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
  },
  {
    quote: "I sold my property within weeks thanks to this platform. The market insights helped me price it right, and the exposure was incredible.",
    author: "John Smith",
    title: "Satisfied Seller",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
  },
  {
    quote: "The loan calculator is a lifesaver! It helped me budget accurately for my new vehicle. Highly recommend this comprehensive platform.",
    author: "Emily White",
    title: "First-time Buyer",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4,
  },
  {
    quote: "Fantastic range of vehicles and properties. The customer support was incredibly responsive when I had a question about a listing. Top-notch!",
    author: "Michael Brown",
    title: "Explorer & Renter",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-ea16da110d43?q=80&w=2576&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
  },
];

// Animation variants for the carousel item (reused from your existing ones)
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

export default function TestimonialsCarouselSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // 0: initial, 1: next, -1: prev

  const testimonials = dummyTestimonials; // Using the dummy data

  // Auto-rotate every 7 seconds
  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setDirection(1); // Indicate next direction for exit animation
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 7000); // Increased interval for better readability
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => {
      const newIndex = (prev + newDirection + testimonials.length) % testimonials.length;
      return newIndex;
    });
  };

  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Background Orbs/Blobs (similar to previous section for consistency) */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-200 dark:bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '-3s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-reverse" style={{ animationDelay: '-5s' }}></div>

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
              onDragEnd={(e, { offset, velocity }) => {
                const swipePower = Math.abs(offset.x) * velocity.x;
                if (swipePower < -10000) { // Swipe left
                  paginate(1);
                } else if (swipePower > 10000) { // Swipe right
                  paginate(-1);
                }
              }}
              className="absolute w-full px-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl border border-blue-100 dark:border-gray-700 transform hover:scale-[1.01] transition-transform duration-300 ease-out cursor-grab">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                    className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 dark:border-blue-400 shadow-md mb-6"
                  >
                    <Image
                      src={testimonials[current].avatarUrl}
                      alt={testimonials[current].author}
                      width={96}
                      height={96}
                      objectFit="cover"
                      loader={customLoader}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  </motion.div>

                  {/* Quote */}
                  <p className="text-xl md:text-2xl italic text-gray-800 dark:text-gray-100 mb-6 font-serif leading-relaxed">
                    &ldquo;{testimonials[current].quote}&rdquo;
                  </p>

                  {/* Rating Stars */}
                  <div className="flex justify-center mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-6 h-6 ${
                          i < testimonials[current].rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Author Info */}
                  <p className="font-bold text-blue-700 dark:text-blue-400 text-lg">
                    {testimonials[current].author}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {testimonials[current].title}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
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

        {/* Dots Indicator */}
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
  );
}