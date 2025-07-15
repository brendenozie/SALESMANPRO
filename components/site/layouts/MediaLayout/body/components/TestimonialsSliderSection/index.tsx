"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Ensure AnimatePresence is imported
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/solid'; // Updated icons for slider controls and rating
import Image from 'next/image';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  source?: string; // e.g., "Rotten Tomatoes", "The New York Times"
  avatarUrl?: string; // Optional URL for author's avatar/image
  rating?: number; // Optional star rating (e.g., 1-5)
  // If the testimonial is about a specific piece of media
  mediaTitle?: string;
  mediaSlug?: string;
}

interface TestimonialsSliderProps {
  testimonials: Testimonial[];
  // loader is removed as Next.js Image handles it
}

/**
 * Innovative & Engaging Testimonials Slider
 * Showcases critics' reviews and audience feedback with a visually appealing carousel.
 */
export default function TestimonialsSlider({ testimonials }: TestimonialsSliderProps) {
  const [idx, setIdx] = React.useState(0);
  const len = testimonials.length;

  // Auto-play feature (optional, but adds dynamism)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIdx((prevIdx) => (prevIdx + 1) % len);
    }, 8000); // Change slide every 8 seconds

    return () => clearInterval(interval); // Clean up on unmount
  }, [len]);

  const prev = () => setIdx((idx - 1 + len) % len);
  const next = () => setIdx((idx + 1) % len);

  // Variants for the testimonial card animation
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.8, // Start slightly smaller
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.6, 0.05, -0.01, 0.9], // Custom cubic-bezier for a springy feel
      },
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.8, // Exit slightly smaller
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <section className="py-20 bg-gradient-to-br from-black to-gray-950 text-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Title */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-16 relative z-10 tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          What Our Audience Says 💖
          <span className="block w-28 h-1 bg-red-600 mx-auto mt-4 rounded-full"></span>
        </motion.h2>

        {/* Testimonial Slider Container */}
        <div className="relative max-w-4xl mx-auto flex items-center justify-center min-h-[300px] md:min-h-[350px]"> {/* Increased min-height */}
          {/* Previous Button */}
          <motion.button
            onClick={prev}
            className="absolute left-0 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full shadow-lg text-white transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400 opacity-80 hover:opacity-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous review"
          >
            <ChevronLeftIcon className="h-7 w-7" />
          </motion.button>

          {/* Testimonial Card */}
          <AnimatePresence initial={false} mode="wait" custom={idx}> {/* 'mode="wait"' ensures old slide exits before new one enters */}
            {testimonials.length > 0 && (
              <motion.div
                key={testimonials[idx].id} // Use unique ID for key
                custom={1} // Custom prop for 'enter' variant (direction)
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute w-full p-8 md:p-12 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 text-center flex flex-col items-center justify-center transform-gpu" // Added border, more shadow
              >
                {testimonials[idx].avatarUrl && (
                  <div className="mx-auto w-24 h-24 rounded-full overflow-hidden mb-6 ring-4 ring-red-600 ring-offset-2 ring-offset-gray-800"> {/* Larger avatar, red ring */}
                    <Image
                      src={testimonials[idx].avatarUrl}
                      alt={testimonials[idx].author}
                      loader={loader}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                {testimonials[idx].rating !== undefined && (
                  <div className="flex justify-center items-center mb-4 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-6 w-6 text-gray-600 `}
                        // className={`h-6 w-6 ${i < testimonials[idx].rating ? 'text-yellow-400' : 'text-gray-600'}`}
                      />
                    ))}
                  </div>
                )}
                <p className="italic text-lg md:text-xl text-gray-200 mb-6 leading-relaxed max-w-2xl">
                  “{testimonials[idx].quote}”
                </p>
                <span className="font-bold text-red-400 block text-lg mb-2">
                  — {testimonials[idx].author}
                </span>
                {testimonials[idx].source && (
                  <span className="text-sm text-gray-400 block">
                    {testimonials[idx].source}
                  </span>
                )}
                {testimonials[idx].mediaTitle && testimonials[idx].mediaSlug && (
                  <motion.a
                    href={`/media/${testimonials[idx].mediaSlug}`}
                    className="mt-4 inline-flex items-center text-red-500 hover:text-red-400 font-semibold transition-colors duration-300"
                    whileHover={{ x: 5 }}
                    aria-label={`View ${testimonials[idx].mediaTitle}`}
                  >
                    About: {testimonials[idx].mediaTitle}
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </motion.a>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          <motion.button
            onClick={next}
            className="absolute right-0 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full shadow-lg text-white transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400 opacity-80 hover:opacity-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next review"
          >
            <ChevronRightIcon className="h-7 w-7" />
          </motion.button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-12 gap-3">
          {testimonials.map((_, i) => (
            <motion.button
              key={i}
              className={`block w-3 h-3 rounded-full transition-colors duration-300 ${
                i === idx ? 'bg-red-600 scale-125' : 'bg-gray-600 hover:bg-gray-500'
              }`}
              onClick={() => setIdx(i)}
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}