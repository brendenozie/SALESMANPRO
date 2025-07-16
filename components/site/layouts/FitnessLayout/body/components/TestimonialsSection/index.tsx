"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image from next/image
import { ArrowRightIcon, ScaleIcon, CurrencyDollarIcon, LightBulbIcon, UsersIcon } from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// New variants for the feature icons
const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "backOut",
    },
  },
};

 


 


// ----------------------------------------------------------------------------
// Testimonials carousel with auto‐rotate
// ----------------------------------------------------------------------------
export default function  Testimonials({ testimonials }:any) {
  const [current, setCurrent] = useState(0);
  const length = testimonials.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % length);
    }, 5000);
    return () => clearInterval(timer);
  }, [length]);

  const nextSlide = () => setCurrent((current + 1) % length);
  const prevSlide = () => setCurrent((current - 1 + length) % length);

  return (
    <section className="py-12 px-4 md:px-8">
      <h2 className="mb-6 text-3xl font-bold text-center">What Our Members Say</h2>
      <div className="relative max-w-xl mx-auto">
        <AnimatePresence>
          {testimonials.map((t:any, idx:any) =>
            idx === current ? (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center bg-gray-50 p-8 rounded-2xl shadow-md"
              >
                <div className="relative w-20 h-20 mb-4">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                    loader={loader}
                  />
                </div>
                <p className="text-gray-800 italic mb-4">"{t.quote}"</p>
                <span className="block text-primary font-semibold">- {t.name}</span>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
          aria-label="Previous testimonial"
        >
          ‹
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
          aria-label="Next testimonial"
        >
          ›
        </button>

        {/* Dots */}
        <div className="mt-4 flex justify-center space-x-2">
          {testimonials.map((_:any, idx:any) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full ${idx === current ? "bg-primary" : "bg-gray-300"}`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}