"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { Testimonial } from "@/types/typings";

// Mock loader for demonstration
const customLoader = ({ src, width, quality }:any) =>
  `${src}?w=${width}&q=${quality || 75}`;

const blurSvg = `data:image/svg+xml;base64,${btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#e0e0e0" />
    <circle cx="50" cy="50" r="20" fill="#bdbdbd" />
  </svg>
`)}`;

// --- Sample Data (fallback) ---
const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Our trip to Patagonia was flawlessly organized! Every detail, from flights to trekking guides, was perfect. Truly an unforgettable adventure!",
    authorName: "Alex Johnson",
    authorTitle: "Adventure Enthusiast",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    rating: 5,
  },
  {
    id: "t2",
    quote:
      "The Bali retreat was exactly what I needed. Pure relaxation, stunning scenery, and incredible cultural experiences.",
    authorName: "Sarah Davis",
    authorTitle: "Yoga Instructor",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
    rating: 5,
  },
];

// --- Star Rating ---
const StarRating = ({ rating = 5 }: { rating?: number | null }) => {
  const fullStars = Math.floor(rating || 0);
  const emptyStars = 5 - fullStars;

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon key={`full-${i}`} className="h-5 w-5 text-yellow-400" />
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      ))}
      <span className="ml-2 text-gray-700 font-semibold text-sm">
        {rating?.toFixed(1) ?? "5.0"}
      </span>
    </div>
  );
};

// --- Testimonial Card ---
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <motion.div
      className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-2xl mx-auto relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <ChatBubbleLeftRightIcon className="h-16 w-16 text-indigo-200 absolute top-4 left-4 opacity-50" />
      <ChatBubbleLeftRightIcon className="h-16 w-16 text-indigo-200 absolute bottom-4 right-4 opacity-50 transform rotate-180" />

      {/* Avatar */}
      <div className="relative w-28 h-28 mb-6 z-10">
        <Image decoding="async"
          src={
            testimonial.avatarUrl ??
            "https://ui-avatars.com/api/?name=Unknown&background=random"
          }
          alt={testimonial.authorName ?? "Anonymous"}
          layout="fill"
          objectFit="cover"
          className="rounded-full ring-4 ring-indigo-400 ring-offset-4 ring-offset-white"
          placeholder="blur"
          blurDataURL={blurSvg}
        />
      </div>

      {/* Quote */}
      <p className="text-gray-800 text-lg italic mb-4 max-w-prose leading-relaxed">
        “{testimonial.quote}”
      </p>

      {/* Rating */}
      <div className="mb-4">
        <StarRating rating={testimonial.rating ?? 5} />
      </div>

      {/* Author Info */}
      <h4 className="text-xl font-bold text-gray-900">
        {testimonial.authorName ?? "Anonymous"}
      </h4>
      {testimonial.authorTitle && (
        <p className="text-sm text-indigo-600 font-medium mb-2">
          {testimonial.authorTitle}
        </p>
      )}
    </motion.div>
  );
}

// --- Main Component ---
export default function TestimonialsSection({
  data = testimonials,
}: {
  data?: Testimonial[];
}) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delay = 6000;

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % data.length);
    }, delay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, data.length]);

  const handlePrev = () =>
    setCurrent((c) => (c - 1 + data.length) % data.length);
  const handleNext = () => setCurrent((c) => (c + 1) % data.length);

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center leading-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          Hear From Our Happy Travelers
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Don&apos;t just take our word for it. Read what real adventurers have
          to say.
        </motion.p>

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={data[current]?.id ?? current}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.7 }}
              className="w-full"
            >
              <TestimonialCard testimonial={data[current]} />
            </motion.div>
          </AnimatePresence>

          {/* Nav Buttons */}
          <motion.button
            onClick={handlePrev}
            className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg"
            aria-label="Previous testimonial"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
          </motion.button>
          <motion.button
            onClick={handleNext}
            className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg"
            aria-label="Next testimonial"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-700" />
          </motion.button>

          {/* Dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {data.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full ${
                  idx === current ? "bg-indigo-600 scale-125" : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
