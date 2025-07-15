"use client";

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/solid'; // Added StarIcon for rating or special pick
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface TopPick {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaLink: string;
  type?: string; // e.g., "Movie", "Series", "Article", "Exclusive"
  rating?: number; // Optional, for a star rating if applicable (e.g., 1-5)
}

interface TopPicksCarouselProps {
  picks: TopPick[];
  onSelect: (item: TopPick) => void; // Callback for when an item is selected/clicked
}

/**
 * Intuitive, Engaging, and Visually Captivating Top Picks Carousel
 * Showcases highlighted content with dynamic transitions and clear calls to action.
 */
export default function TopPicksCarousel({ picks, onSelect }: TopPicksCarouselProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false); // To pause auto-play on hover
  const length = picks ? picks.length : 0;

  // Auto-play functionality
  useEffect(() => {
    if (length <= 1) return; // No auto-play if only one or no picks
    let interval: NodeJS.Timeout;
    if (!isHovered) {
      interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % length);
      }, 5000); // Change slide every 5 seconds
    }
    return () => clearInterval(interval);
  }, [current, length, isHovered]);

  const prevSlide = () => {
    setCurrent((current - 1 + length) % length);
    setIsHovered(false); // Reset hover state on manual navigation
  };
  const nextSlide = () => {
    setCurrent((current + 1) % length);
    setIsHovered(false); // Reset hover state on manual navigation
  };

  if (length === 0) {
    return null; // Or a placeholder if no picks are available
  }

  // Animation variants for individual carousel items
  const carouselItemVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    })
  };

  // Header variants for consistency
  const headingVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section
      className="py-20 bg-gradient-to-br from-black to-gray-950 text-white overflow-hidden relative" // Added relative for absolute children
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-16 relative z-10 tracking-tight"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={headingVariants}
        >
          Spotlight: Our Top Picks! ✨
          <span className="block w-48 h-1 bg-red-600 mx-auto mt-4 rounded-full"></span>
        </motion.h2>

        <div className="relative h-[480px] md:h-[550px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-gray-800 border-2 border-red-800">
          <AnimatePresence initial={false} custom={current}> {/* custom prop for AnimatePresence */}
            {picks.map((item, index) =>
              index === current && (
                <motion.div
                  key={item.id}
                  className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center p-6 md:p-10"
                  variants={carouselItemVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={index < current ? -1 : 1} // Direction for exit animation
                >
                  {/* Image Section */}
                  <div className="w-full lg:w-1/2 h-64 md:h-80 lg:h-full relative flex-shrink-0 rounded-2xl overflow-hidden shadow-xl border-2 border-gray-700">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                      className="object-cover object-center brightness-75 group-hover:brightness-50 transition-all duration-500 ease-in-out"
                      priority // Prioritize loading for top picks
                    />
                    {/* Overlay with type/rating */}
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      {item.type && (
                        <span className="inline-flex items-center text-sm font-bold bg-red-600 text-white px-3 py-1 rounded-full shadow-lg">
                          {item.type}
                        </span>
                      )}
                      {item.rating && (
                        <span className="inline-flex items-center text-sm font-bold bg-yellow-500 text-gray-900 px-3 py-1 rounded-full shadow-lg">
                          <StarIcon className="h-4 w-4 mr-1" /> {item.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="mt-8 lg:mt-0 lg:ml-12 max-w-lg text-center lg:text-left space-y-5 flex-grow">
                    <motion.h3
                      className="text-3xl md:text-4xl font-extrabold text-white leading-tight"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    >
                      {item.title}
                    </motion.h3>
                    <motion.p
                      className="text-lg md:text-xl text-gray-300 leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      {item.description}
                    </motion.p>
                    <motion.button
                      onClick={() => onSelect(item)} // Use onSelect prop for navigation
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-7 rounded-full shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400 text-lg group"
                      aria-label={`Discover more about ${item.title}`}
                    >
                      Discover Now
                      <ArrowRightIcon className="h-6 w-6 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </motion.button>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>

          {/* Navigation Controls (positioned relative to the carousel container) */}
          {length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute top-1/2 left-4 md:left-6 transform -translate-y-1/2 bg-gray-700/60 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-red-600 transition-colors duration-300 z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon className="h-7 w-7 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 right-4 md:right-6 transform -translate-y-1/2 bg-gray-700/60 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-red-600 transition-colors duration-300 z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400"
                aria-label="Next slide"
              >
                <ChevronRightIcon className="h-7 w-7 text-white" />
              </button>
            </>
          )}

          {/* Dots Indicators (positioned at the bottom) */}
          {length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
              {picks.map((_, idx) => (
                <button
                  key={idx}
                  className={`block h-3 w-3 rounded-full transition-all duration-300 ${
                    idx === current ? "bg-red-600 w-6" : "bg-gray-400/50 hover:bg-gray-300/70"
                  }`}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}