"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, FilmIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/solid'; // Added relevant icons
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface VideoItem {
  id: string;
  title: string;
  imageUrl: string;
  ctaLink: string; // Link to the full video player page or external video
  duration?: string; // e.g., "2:30", "15 min"
  views?: string; // e.g., "1.2M", "500K"
  category?: string; // e.g., "Trailers", "Interviews", "Behind the Scenes"
}

interface LatestVideosSectionProps {
  videos: VideoItem[];
  // loader is removed as Next.js Image handles it
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;


/**
 * Intuitive, Engaging, and Visually Appealing Latest Videos Section
 * Showcases recent video content with dynamic cards and clear playback options.
 */
export default function LatestVideosSection({ videos }: LatestVideosSectionProps) {
  const router = useRouter();

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
      boxShadow: "0 18px 35px rgba(0,0,0,0.5)", // Deeper shadow on hover
      transition: { duration: 0.3 },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-16 relative z-10 tracking-tight"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={headingVariants}
        >
          Fresh Reels & Exclusive Clips 🎬
          <span className="block w-36 h-1 bg-red-600 mx-auto mt-4 rounded-full"></span>
        </motion.h2>

        {/* Latest Videos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> {/* Increased gap for more breathing room */}
          {videos && videos.map((vid, index) => (
            <motion.div
              key={vid.id}
              className="relative rounded-xl overflow-hidden shadow-xl cursor-pointer group bg-gray-800" // Added group, bg-gray-800
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1 }} // Staggered appearance
              onClick={() => router.push(vid.ctaLink)}
              aria-label={`Watch video: ${vid.title}`}
            >
              {/* Video Thumbnail (with improved aspect ratio handling) */}
              <div className="relative w-full pb-[56.25%] overflow-hidden"> {/* Consistent 16:9 aspect ratio */}
                <Image
                  src={vid.imageUrl}
                  alt={vid.title || "Latest Video"}
                  loader={loader}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center brightness-[.7] group-hover:brightness-[.5] group-hover:scale-110 transition-all duration-500 ease-in-out" // Zoom & darken on hover
                  priority={index < 4} // Prioritize first few images
                />
                {/* Play Button Overlay (always visible but enhanced) */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors duration-300"> {/* Darker overlay on hover */}
                  <motion.div
                    className="bg-white/80 p-4 rounded-full text-red-600 shadow-lg group-hover:bg-red-600 group-hover:text-white transition-all duration-300" // Play button changes color on hover
                    initial={{ scale: 0.9 }}
                    variants={{
                      hover: { scale: 1.1, transition: { type: "spring", stiffness: 400, damping: 20 } }
                    }}
                  >
                    <PlayCircleIcon className="h-10 w-10 md:h-12 md:w-12" /> {/* Larger play icon */}
                  </motion.div>
                </div>

                {/* Video Meta Information Overlay (Top Right) */}
                <div className="absolute top-3 right-3 flex flex-col items-end space-y-1">
                  {vid.category && (
                    <span className="inline-flex items-center text-xs font-medium bg-red-700 text-white px-2 py-1 rounded-full">
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

              {/* Video Title */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-white leading-tight truncate">
                  {vid.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}