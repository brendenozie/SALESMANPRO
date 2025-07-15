"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, PlusCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid'; // Added More Info and Plus icons
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ReleaseItem {
  id: string;
  title: string;
  imageUrl: string;
  releaseDate: string; // Or a more specific 'year' or 'duration' field
  slug: string; // Assuming a slug for navigation to details page
  videoSlug?: string; // Optional video slug for direct play
  genre?: string; // Optional genre for display
}

interface LatestReleasesSectionProps {
  releases: ReleaseItem[];
  onPlay: (item: ReleaseItem) => void; // Function to handle playing the media
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;


/**
 * Visually Appealing & Engaging Latest Releases Section
 * Showcases new media content with interactive cards and clear calls to action.
 */
export default function LatestReleasesSection({
  releases,
  onPlay,
}: LatestReleasesSectionProps) {
  const router = useRouter();

  // Animation variants for staggered appearance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger children animations by 0.1 seconds
        delayChildren: 0.2,
      },
    },
  };

  // Animation variants for individual cards
  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
    hover: {
      scale: 1.03,
      y: -5, // Slight lift on hover
      boxShadow: "0 15px 30px rgba(0,0,0,0.5)", // More pronounced shadow
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  const handleItemClick = (item: ReleaseItem) => {
    router.push(`/media/${item.slug}`); // Navigate to item details page
  };

  return (
    <section className="py-20 bg-gradient-to-tl from-black via-gray-900 to-black text-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Title */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-16 relative z-10 tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Fresh Arrivals 🌟 Hot Off The Press!
          <span className="block w-32 h-1 bg-red-600 mx-auto mt-4 rounded-full"></span>
        </motion.h2>

        {/* Responsive Grid of Releases */}
        <motion.div
          className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {releases && releases.map((item: ReleaseItem) => (
            <motion.div
              key={item.id}
              className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg group" // Enhanced shadow, added group for hover effects
              variants={itemVariants}
              whileHover="hover"
              onClick={() => handleItemClick(item)} // Navigate on card click
              aria-label={`View details for ${item.title}`}
            >
              {/* Thumbnail */}
              <div className="w-full h-64 relative overflow-hidden"> {/* Increased height for better visual */}
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  loader={loader}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center brightness-[.7] group-hover:brightness-[.5] group-hover:scale-110 transition-all duration-500 ease-in-out" // Zoom and darken on hover
                  priority={releases.indexOf(item) < 4} // Prioritize first few images
                />
                {/* Play Icon Overlay on Image */}
                {item.videoSlug && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0 }}
                    variants={{
                      hover: { opacity: 1, transition: { delay: 0.1 } }
                    }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); onPlay(item); }} // Stop propagation to prevent card click
                      className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400 transform scale-90 group-hover:scale-100 transition-transform duration-300"
                      aria-label={`Play trailer for ${item.title}`}
                    >
                      <PlayCircleIcon className="h-8 w-8" />
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Info & Action Buttons */}
              <div className="p-5 space-y-3">
                {item.genre && (
                  <span className="text-xs font-medium bg-red-700 text-white px-2 py-1 rounded-full inline-block">
                    {item.genre}
                  </span>
                )}
                <h3 className="text-xl font-bold text-white leading-tight truncate">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {item.releaseDate}
                </p>

                <div className="flex gap-3 pt-2">
                  {/* More Info Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30 text-sm"
                    aria-label={`More info about ${item.title}`}
                  >
                    <InformationCircleIcon className="h-5 w-5" />
                    Info
                  </button>

                  {/* Add to Watchlist Button (Example secondary action) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); /* Add to watchlist logic here */ alert(`Added ${item.title} to watchlist!`); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400 text-sm"
                    aria-label={`Add ${item.title} to watchlist`}
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                    List
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}