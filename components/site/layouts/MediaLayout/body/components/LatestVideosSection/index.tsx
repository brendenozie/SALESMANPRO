'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, FilmIcon, ClockIcon, EyeIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- Types ---
interface VideoItem {
  id: string;
  title: string;
  imageUrl: string;
  ctaLink: string; // Link to the full video player page or external video
  duration?: string; // e.g., "2:30", "15 min"
  views?: string; // e.g., "1.2M", "500K"
  category?: string; // e.g., "Keynote", "Product Demo", "Interview"
}

interface LatestVideosSectionProps {
  videos?: VideoItem[]; // Made optional for robust fallbacks
  title?: string;
}

// --- Mock Data (Fallbacks for demonstration) ---
const fallbackVideos: VideoItem[] = [
  {
    id: 'v4',
    title: 'Keynote: Next-Gen Platform Launch',
    imageUrl: 'https://images.unsplash.com/photo-1549045337-6f176662e153?q=80&w=2670&auto=format&fit=crop',
    ctaLink: '/media/video/next-gen-platform',
    duration: '45:12',
    views: '1.2M',
    category: 'Keynote',
  },
  {
    id: 'v5',
    title: 'Product Demo: Advanced Analytics Module',
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb197135?q=80&w=2670&auto=format&fit=crop',
    ctaLink: '/media/video/analytics-module-demo',
    duration: '10:30',
    views: '450K',
    category: 'Product Demo',
  },
  {
    id: 'v6',
    title: 'Executive Interview: The 2025 Vision',
    imageUrl: 'https://images.unsplash.com/photo-1542435503-9d10e0147926?q=80&w=2670&auto=format&fit=crop',
    ctaLink: '/media/video/executive-interview-2025',
    duration: '22:05',
    views: '210K',
    category: 'Interview',
  },
  {
    id: 'v7',
    title: 'Client Success Story: Global Scale Deployment',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a941215be?q=80&w=2670&auto=format&fit=crop',
    ctaLink: '/media/video/global-deployment-case',
    duration: '06:15',
    views: '80K',
    category: 'Case Study',
  },
];

// --- Helper: Image Loader (Kept Consistent) ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;


/**
 * Transformed Latest Videos Section: Unified Indigo/Corporate Theme
 */
export default function LatestVideosSection({ videos, title }: LatestVideosSectionProps) {
  const router = useRouter();
  
  // Use props or fallback
  const displayVideos = (videos && videos.length > 0) ? videos : fallbackVideos;

  // Animation variants for section heading
  const headingVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Animation variants for individual video cards
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 150, damping: 15 } },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 20px rgba(0,0,0,0.2)", // Softer shadow for corporate theme
      transition: { duration: 0.3 },
    },
  };

  return (
    // Updated background to match the established theme
    <section id="videos" className="relative py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      
      {/* Subtle Grid Background (Consistent Theme) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Header - Styled for Corporate/Editorial Theme */}
        <motion.div
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={headingVariants}
        >
            <div className='max-w-3xl'>
                <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-widest uppercase mb-3">
                    Video Content Hub
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                    {title || "Recent Demos, Keynotes & Tutorials"}
                </h2>
            </div>
            
            <button
                onClick={() => router.push('/media/archive')} // Assuming /media/archive is the video library page
                className="flex-shrink-0 inline-flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group py-2 px-4 rounded-full border border-indigo-200 dark:border-indigo-900"
            >
                View All Media
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
        </motion.div>

        {/* Latest Videos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayVideos.map((vid, index) => (
            <motion.div
              key={vid.id}
              className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-500 transition-all duration-300"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(vid.ctaLink)}
              aria-label={`Watch video: ${vid.title}`}
            >
              
              {/* Video Thumbnail (16:9) */}
              <div className="relative w-full pb-[56.25%] overflow-hidden">
                <Image decoding="async"
                  src={vid.imageUrl}
                  alt={vid.title || "Latest Video"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center brightness-[.85] group-hover:brightness-[.65] group-hover:scale-105 transition-all duration-500 ease-in-out" // Subtle zoom & darkening
                  priority={index < 4}
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors duration-300">
                  <motion.div
                    // Updated colors for play button
                    className="bg-white/90 p-3 rounded-full text-indigo-600 shadow-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 ring-4 ring-indigo-500/30"
                    initial={{ scale: 0.9 }}
                    variants={{
                      hover: { scale: 1.1, transition: { type: "spring", stiffness: 400, damping: 20 } }
                    }}
                  >
                    <PlayCircleIcon className="h-10 w-10" />
                  </motion.div>
                </div>

                {/* Video Meta Information Overlay (Top Right) */}
                <div className="absolute top-3 right-3 flex flex-col items-end space-y-1">
                  {vid.category && (
                    <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white px-3 py-1 rounded-full shadow-md">
                      <FilmIcon className="h-3 w-3 mr-1" /> {vid.category}
                    </span>
                  )}
                  {vid.duration && (
                    <span className="inline-flex items-center text-xs font-medium bg-black/60 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                      <ClockIcon className="h-3 w-3 mr-1" /> {vid.duration}
                    </span>
                  )}
                </div>

                {/* Views Count Overlay (Bottom Left) */}
                {vid.views && (
                  <div className="absolute bottom-3 left-3 flex items-center text-xs font-medium bg-black/60 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                    <EyeIcon className="h-3 w-3 mr-1" /> {vid.views} Views
                  </div>
                )}
              </div>

              {/* Video Title - Moved outside thumbnail for cleaner layout */}
              <div className="p-4 md:p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-snug group-hover:text-indigo-600 transition-colors">
                  {vid.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Unified Mobile/Primary CTA (for consistency) */}
        <div className="mt-16 text-center">
            <motion.a 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                onClick={() => router.push('/media/archive')}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-300 cursor-pointer"
            >
                Explore More Videos
                <ArrowRightIcon className="w-5 h-5 ml-2" />
            </motion.a>
        </div>

      </div>
    </section>
  );
}