"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

// Loader function
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Motion variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.5 },
      scale: { duration: 0.5 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.5 },
      scale: { duration: 0.5 },
    },
  }),
};

// Unified Testimonial type
export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  avatarUrl: string;
  authorTitle?: string;
  program?: string;
  rating: number;
}

// Dummy fallback data
const dummyTestimonials: Testimonial[] = [
  {
    id: "test1",
    quote:
      "Joining this community was the best decision for my fitness journey! The trainers are incredibly supportive, and the variety of classes keeps me motivated every day.",
    authorName: "Sarah Chen",
    avatarUrl: "/images/avatar-sarah.jpg",
    authorTitle: "Marketing Specialist",
    program: "Elite Fitness Program",
    rating: 5,
  },
  {
    id: "test2",
    quote:
      "I never thought I'd enjoy working out, but the virtual classes here are a game-changer. The flexibility and expert guidance have helped me stay consistent and feel fantastic.",
    authorName: "David Kim",
    avatarUrl: "/images/avatar-david.jpg",
    authorTitle: "Software Engineer",
    program: "Virtual Yoga & Mindfulness",
    rating: 4,
  },
  {
    id: "test3",
    quote:
      "The personalized nutrition advice I received was revolutionary. It wasn’t just about weight loss, but about a holistic approach to wellness that truly changed my life.",
    authorName: "Maria Rodriguez",
    avatarUrl: "/images/avatar-maria.jpg",
    authorTitle: "Small Business Owner",
    program: "Nutrition Coaching",
    rating: 5,
  },
  {
    id: "test4",
    quote:
      "The community here is so welcoming and inspiring. It feels like a second family. Every session leaves me energized and ready to tackle anything!",
    authorName: "Omar Hassan",
    avatarUrl: "/images/avatar-omar.jpg",
    authorTitle: "Graphic Designer",
    program: "Group Strength Classes",
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
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const t = testimonials[page];

  return (
    <section className="relative py-20 bg-gradient-to-br from-primary-light/20 to-primary/10 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary opacity-5 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-dark opacity-5 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
        <motion.h2
          className="mb-12 text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          What Our <span className="text-primary-dark">Members Say</span>
        </motion.h2>

        <div className="relative h-[420px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            {t && (
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute w-full max-w-lg bg-white rounded-2xl p-10 shadow-lg flex flex-col items-center text-center gap-6"
              >
                {/* Avatar */}
                <Image
                  src={t.avatarUrl}
                  alt={t.authorName}
                  width={96}
                  height={96}
                  className="rounded-full object-cover ring-4 ring-primary/20 shadow-sm"
                  loader={loader}
                />

                {/* Divider */}
                <div className="w-12 border-t border-gray-200" />

                {/* Quote */}
                <p className="text-xl font-medium text-gray-700 italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark">{t.authorName}</h3>
                  {t.authorTitle && <p className="text-sm text-gray-500">{t.authorTitle}</p>}
                  {t.program && (
                    <p className="text-xs text-gray-400 mt-1">{t.program}</p>
                  )}
                  {/* Rating */}
                  <div className="flex justify-center mt-2">
                    {[...Array(t.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Arrows */}
          <button
            onClick={() => paginate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-50"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-50"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Dots */}
        <div className="mt-10 flex justify-center gap-3">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage([idx, idx > page ? 1 : -1])}
              className={`w-3 h-3 rounded-full transition ${
                idx === page ? "bg-primary-dark scale-110" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
