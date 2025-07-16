"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  ChatBubbleLeftRightIcon, // For testimonial icon
  ChevronLeftIcon, // For carousel navigation
  ChevronRightIcon, // For carousel navigation
  StarIcon, // For star ratings in testimonials
} from "@heroicons/react/24/solid"; // Using solid icons for consistency and visual weight

// --- Shared Utilities (from previous sections for consistency) ---

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Base64 encoded SVG for a simple blur placeholder
const blurSvg = `data:image/svg+xml;base64,${btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#e0e0e0" />
    <circle cx="50" cy="50" r="20" fill="#bdbdbd" />
  </svg>
`)}`;

// Animation variants for consistent staggered reveals across sections
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1, // Delay between child animations
      delayChildren: 0.2,   // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100, // Softer spring for a gentle bounce
      damping: 15,    // More damping for a smoother stop
    },
  },
};

// --- Dummy Data for Testimonials (Enhanced) ---
const testimonials = [
  {
    id: "t1",
    quote: "Our trip to Patagonia was flawlessly organized! Every detail, from flights to trekking guides, was perfect. Truly an unforgettable adventure!",
    name: "Alex Johnson",
    role: "Adventure Enthusiast",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
    trip: "Patagonia Trekking Expedition",
  },
  {
    id: "t2",
    quote: "The Bali retreat was exactly what I needed. Pure relaxation, stunning scenery, and incredible cultural experiences. Highly recommend this agency!",
    name: "Sarah Davis",
    role: "Yoga Instructor",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
    trip: "Enchanting Bali Retreat",
  },
  {
    id: "t3",
    quote: "Planning our family vacation to Alaska was stress-free thanks to their expert advice. The kids loved the wildlife tours!",
    name: "Michael Brown",
    role: "Family Man",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a3dd782dab4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 4,
    trip: "Alaskan Wilderness Adventure",
  },
  {
    id: "t4",
    quote: "From the moment we landed in Paris, everything was magical. The itinerary was perfect, blending iconic sights with charming local spots.",
    name: "Emily White",
    role: "Travel Blogger",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
    trip: "Parisian Romantic Escape",
  },
  {
    id: "t5",
    quote: "The safari exceeded all expectations! Seeing the Great Migration was a dream come true. Our guide was incredibly knowledgeable.",
    name: "James Wilson",
    role: "Wildlife Photographer",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
    trip: "Safari in Serengeti",
  },
];

// --- StarRating Component (reused from Listings section) ---
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon key={`full-${i}`} className="h-5 w-5 text-yellow-400" />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <StarIcon className="h-5 w-5 text-yellow-400" />
          <div className="absolute top-0 right-0 overflow-hidden" style={{ width: '50%' }}>
            <StarIcon className="h-5 w-5 text-gray-300" />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      ))}
      <span className="ml-2 text-gray-700 font-semibold text-sm">{rating.toFixed(1)}</span>
    </div>
  );
};

// TestimonialCard.jsx
function TestimonialCard({ testimonial }) {
  return (
    <motion.div
      className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-2xl mx-auto relative overflow-hidden" // Increased padding, more rounded, stronger shadow
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Quote Icon */}
      <ChatBubbleLeftRightIcon className="h-16 w-16 text-indigo-200 absolute top-4 left-4 opacity-50" />
      <ChatBubbleLeftRightIcon className="h-16 w-16 text-indigo-200 absolute bottom-4 right-4 opacity-50 transform rotate-180" />

      {/* Avatar */}
      <div className="relative w-28 h-28 mb-6 z-10"> {/* Larger avatar */}
        <Image
          src={testimonial.avatar}
          alt={testimonial.name}
          layout="fill"
          objectFit="cover"
          className="rounded-full ring-4 ring-indigo-400 ring-offset-4 ring-offset-white" // Ring around avatar
          loader={customLoader}
          placeholder="blur"
          blurDataURL={blurSvg}
        />
      </div>

      {/* Testimonial Quote */}
      <p className="text-gray-800 text-lg italic mb-4 max-w-prose leading-relaxed">
        “{testimonial.quote}”
      </p>

      {/* Rating */}
      <div className="mb-4">
        <StarRating rating={testimonial.rating} />
      </div>

      {/* Author Info */}
      <h4 className="text-xl font-bold text-gray-900">{testimonial.name}</h4>
      <p className="text-sm text-indigo-600 font-medium mb-2">{testimonial.role}</p>
      {testimonial.trip && (
        <p className="text-sm text-gray-500">Trip: <span className="font-semibold">{testimonial.trip}</span></p>
      )}
    </motion.div>
  );
}

// Testimonials.jsx
export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);
  const delay = 6000; // Auto-play delay in milliseconds

  // Auto-play logic
  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, delay);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [current, testimonials.length]);

  // Navigation functions
  const handlePrev = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setCurrent((c) => (c + 1) % testimonials.length);
  };

  // Dot navigation handler
  const handleDotClick = (idx) => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setCurrent(idx);
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden"> {/* New gradient background */}
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center leading-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Hear From Our Happy Travelers
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Don't just take our word for it. Read what real adventurers have to say about their unforgettable journeys with us.
        </motion.p>

        <div className="relative max-w-3xl mx-auto"> {/* Adjusted max-width for carousel */}
          <AnimatePresence mode="wait"> {/* 'mode="wait"' ensures exit animation completes before next enters */}
            <motion.div
              key={testimonials[current].id} // Key change ensures re-render and animation
              initial={{ opacity: 0, x: 100 }} // Slide in from right
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }} // Slide out to left
              transition={{ duration: 0.7, ease: "easeOut" }} // Smoother transition
              className="w-full" // Ensure it takes full width for positioning
            >
              <TestimonialCard testimonial={testimonials[current]} />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.button
            onClick={handlePrev}
            className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg z-10 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Previous testimonial"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
          </motion.button>
          <motion.button
            onClick={handleNext}
            className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg z-10 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Next testimonial"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-700" />
          </motion.button>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-3"> {/* Increased margin and space */}
            {testimonials.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  idx === current ? "bg-indigo-600 scale-125" : "bg-gray-300" // Active dot larger
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}