"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image"; // Make sure Image component is imported
import {
  MapPinIcon, // For location input
  CurrencyDollarIcon, // For price range
   // For vehicle type (Assuming a similar icon exists or can be custom)
  MagnifyingGlassIcon, // For search button
} from "@heroicons/react/24/outline"; // Import relevant icons

import Link from "next/link";

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal (reused for consistency)
const containerVariants = {
  hidden: { opacity: 0, y: 30 }, // Increased y for more noticeable entrance
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1, // Slightly slower stagger for more impact
      delayChildren: 0.2, // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 }, // Increased y and slightly smaller scale
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100, // Softer spring
      damping: 15, // More damping for a smoother stop
    },
  },
};

// Dummy Data for Vehicle Types (Expanded)
const vehicleTypes = [
  "Sedan",
  "SUV",
  "Truck",
  "Coupe",
  "Hatchback",
  "Convertible",
  "Minivan",
  "Electric",
];

// Dummy data for banner images (example)
const heroBanners = [
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1542362543-b2611e9f16d7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Luxury sports car",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1599388909403-9e9f902d28f8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Modern SUV in an urban setting",
  },
  {
    type: "video",
    src: "/assets/hero-video.mp4", // Ensure this path is correct and video exists
    alt: "Car driving through scenic route",
  },
];

// Enhanced HeroSection Component
interface HeroSectionProps {
  // You might not need bannerUrl if using an internal carousel
  // If still external, define it as string[]
}


// TestimonialCard.tsx
function TestimonialCard({ testimonial }: any) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm max-w-md mx-auto">
      <div className="relative w-20 h-20 mb-4">
        <Image
          src={testimonial.avatar}
          alt={testimonial.name}
          layout="fill"
          objectFit="cover"
          className="rounded-full"
          placeholder="blur"
          blurDataURL="/assets/blur-placeholder.png"
          loader={loader}
        />
      </div>
      <p className="text-gray-800 italic mb-4">“{testimonial.quote}”</p>
      <h4 className="text-lg font-semibold">{testimonial.name}</h4>
      <p className="text-sm text-gray-500">{testimonial.role}</p>
    </div>
  );
}

// Testimonials.tsx

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const delay = 5000;
  const items = store.testimonials;

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, delay);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [current, items.length]);

  const prev = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setCurrent((c) => (c - 1 + items.length) % items.length);
  };
  const next = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setCurrent((c) => (c + 1) % items.length);
  };

  return (
    <section className="py-12 px-4 bg-gray-50">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">
        What Our Travelers Say
      </h2>
      <div className="relative max-w-xl mx-auto">
        <AnimatePresence initial={false}>
          <motion.div
            key={`${items[current].author.slice(0,1)+current}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
          >
            <TestimonialCard testimonial={items[current]} />
          </motion.div>
        </AnimatePresence>

        {/* Prev/Next */}
        <button
          onClick={prev}
          className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
          aria-label="Previous testimonial"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
          aria-label="Next testimonial"
        >
          ›
        </button>

        {/* Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
                setCurrent(idx);
              }}
              className={`w-3 h-3 rounded-full ${
                idx === current ? "bg-indigo-600" : "bg-gray-300"
              }`}
              aria-label={`Show testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
