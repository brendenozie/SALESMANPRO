'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon, LightBulbIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- Types ---
interface TopPick {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaLink: string;
  type?: string; // e.g., "Report", "Webinar", "Solution"
  rating?: number; // Optional, for a star rating if applicable (e.g., 1-5)
}

interface TopPicksCarouselProps {
  picks?: TopPick[];
  onSelect: (item: TopPick) => void; 
}

// --- Mock Data (Fallbacks for demonstration) ---
const fallbackPicks: TopPick[] = [
    {
        id: 'p1',
        title: '2025 Market Trend Analysis: AI Integration',
        description: 'A deep dive into how large language models are restructuring B2B marketing funnels and predicting consumer behavior in the next fiscal year.',
        imageUrl: 'https://images.unsplash.com/photo-1543286386-713bdd531db2?q=80&w=2670&auto=format&fit=crop',
        ctaLink: '/reports/ai-market-analysis-2025',
        type: 'Exclusive Report',
        rating: 4.8,
    },
    {
        id: 'p2',
        title: 'Live Webinar: Mastering Data Governance',
        description: 'Join our Chief Data Officer for a 60-minute session on implementing strict data quality protocols and meeting global compliance standards.',
        imageUrl: 'https://images.unsplash.com/photo-1551288258-29759d3d32a4?q=80&w=2670&auto=format&fit=crop',
        ctaLink: '/webinars/data-governance-masterclass',
        type: 'Upcoming Event',
        rating: 5.0,
    },
    {
        id: 'p3',
        title: 'Client Success Story: Enterprise Cloud Migration',
        description: 'Learn how we helped a Fortune 500 company achieve 40% cost reduction by migrating their legacy infrastructure to our hybrid cloud solution.',
        imageUrl: 'https://images.unsplash.com/photo-1556740714-a839f977c05b?q=80&w=2670&auto=format&fit=crop',
        ctaLink: '/case-studies/cloud-migration-success',
        type: 'Case Study',
        rating: 4.6,
    }
];

// --- Helper: Image Loader (Kept Consistent) ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;


// --- Core Component ---
export default function TopPicksCarousel({ picks, onSelect }: TopPicksCarouselProps) {
  const router = useRouter();
  const displayPicks = (picks && picks.length > 0) ? picks : fallbackPicks;
  
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const length = displayPicks.length;
  // Use a state for direction to handle AnimatePresence logic
  const [direction, setDirection] = useState(0); 

  // Auto-play functionality
  useEffect(() => {
    if (length <= 1) return;
    let interval: NodeJS.Timeout;
    if (!isHovered) {
      interval = setInterval(() => {
        setDirection(1); // Set direction forward for auto-play
        setCurrent((prev) => (prev + 1) % length);
      }, 7000); // Change slide every 7 seconds (Slightly slower for corporate content)
    }
    return () => clearInterval(interval);
  }, [current, length, isHovered]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((current - 1 + length) % length);
    setIsHovered(false);
  };
  
  const nextSlide = () => {
    setDirection(1);
    setCurrent((current + 1) % length);
    setIsHovered(false);
  };

  if (length === 0) {
    return null;
  }

  // Animation variants for individual carousel items
  const carouselItemVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%', // Use percentage for better responsiveness
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
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%', // Reversed exit direction
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
      id="spotlight-carousel"
      // Changed background to light gray/white for consistency
      className="py-24 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        {/* Subtle Grid Background (Consistent Theme) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>


        <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Section Header - Styled for Corporate/Editorial Theme */}
            <motion.div
                className="text-center mb-16 max-w-4xl mx-auto"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={headingVariants}
            >
                <div className="flex items-center justify-center gap-2 mb-3">
                    <LightBulbIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-sm">
                        Featured Content
                    </span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                    Spotlight: Our Top Industry Picks
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    Explore the most valuable reports, events, and case studies driving transformation.
                </p>
            </motion.div>

            <div className="relative h-[480px] md:h-[550px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800">
                <AnimatePresence initial={false} custom={direction}>
                    {displayPicks.map((item, index) =>
                        index === current && (
                            <motion.div
                                key={item.id}
                                // Adjusted positioning for better control within a relative container
                                className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center p-6 md:p-10"
                                variants={carouselItemVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                custom={direction} 
                            >
                                {/* Image Section */}
                                <div className="w-full lg:w-1/2 h-64 md:h-80 lg:h-full relative flex-shrink-0 rounded-2xl overflow-hidden shadow-xl">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.title}
                                        loader={loader}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                                        // Brighter default image for light theme background
                                        className="object-cover object-center brightness-90 transition-all duration-500 ease-in-out" 
                                        priority
                                    />
                                    {/* Overlay with type/rating (Indigo/Corporate Style) */}
                                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                                        {item.type && (
                                            <span className="inline-flex items-center text-sm font-bold bg-indigo-600 text-white px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                                                {item.type}
                                            </span>
                                        )}
                                        {item.rating && (
                                            <span className="inline-flex items-center text-sm font-bold bg-yellow-400 text-gray-900 px-3 py-1 rounded-full shadow-lg">
                                                <StarIcon className="h-4 w-4 mr-1 text-yellow-900" /> {item.rating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="mt-8 lg:mt-0 lg:ml-12 max-w-lg text-center lg:text-left space-y-5 flex-grow">
                                    <motion.h3
                                        className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.6 }}
                                    >
                                        {item.title}
                                    </motion.h3>
                                    <motion.p
                                        className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.6 }}
                                    >
                                        {item.description}
                                    </motion.p>
                                    <motion.button
                                        onClick={() => onSelect(item)}
                                        whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(99, 102, 241, 0.4)" }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        // Changed CTA style to Indigo
                                        className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-7 rounded-full shadow-lg shadow-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 text-lg group"
                                        aria-label={`Discover more about ${item.title}`}
                                    >
                                        Access Content
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
                            // Changed button colors to match Indigo theme
                            className="absolute top-1/2 left-4 md:left-6 transform -translate-y-1/2 bg-gray-700/60 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-indigo-600 transition-colors duration-300 z-20 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
                            aria-label="Previous slide"
                        >
                            <ChevronLeftIcon className="h-7 w-7" />
                        </button>
                        <button
                            onClick={nextSlide}
                            // Changed button colors to match Indigo theme
                            className="absolute top-1/2 right-4 md:right-6 transform -translate-y-1/2 bg-gray-700/60 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-indigo-600 transition-colors duration-300 z-20 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
                            aria-label="Next slide"
                        >
                            <ChevronRightIcon className="h-7 w-7" />
                        </button>
                    </>
                )}

                {/* Dots Indicators (positioned at the bottom) */}
                {length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
                        {displayPicks.map((_, idx) => (
                            <button
                                key={idx}
                                // Changed dot colors to match Indigo theme
                                className={`block h-3 w-3 rounded-full transition-all duration-300 ${
                                    idx === current ? "bg-indigo-600 w-6" : "bg-gray-400/50 hover:bg-gray-300/70"
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