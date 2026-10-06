'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PlusIcon, InformationCircleIcon, ClockIcon, ArrowUpRightIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- Types (Kept Consistent) ---
type ReleaseItem = {
  id: string;
  title: string;
  imageUrl: string;
  releaseDate: string; // Display string like "Oct 2024" or "2h 15m"
  slug: string;
  videoSlug?: string;
  genre?: string;
};

interface LatestReleasesSectionProps {
  title?: string; // Added for flexibility
  subtitle?: string; // Added for flexibility
  releases?: ReleaseItem[]; // Made optional for fallbacks
  onPlay: (item: ReleaseItem) => void;
}

// --- Mock Data (Consistent Fallback Strategy) ---
const fallbackReleases: ReleaseItem[] = [
  {
    id: 'v1',
    title: 'Q3 Earnings Call: Innovation & Growth',
    imageUrl: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=2670&auto=format&fit=crop',
    releaseDate: '2h 15m',
    slug: 'q3-earnings-2024',
    videoSlug: 'youtube-id-1',
    genre: 'Finance',
  },
  {
    id: 'v2',
    title: 'The Future of Remote Diagnostics Panel',
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2670&auto=format&fit=crop',
    releaseDate: 'Sep 24, 2024',
    slug: 'remote-diagnostics-panel',
    videoSlug: 'youtube-id-2',
    genre: 'Technology',
  },
  {
    id: 'v3',
    title: 'Behind the Scenes: Product Engineering Deep Dive',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9dab1d21fc1e?q=80&w=2670&auto=format&fit=crop',
    releaseDate: 'Oct 01, 2024',
    slug: 'engineering-deep-dive',
    videoSlug: 'youtube-id-3',
    genre: 'Engineering',
  },
];

// --- Helper: Image Loader (Consistent with MediaSection) ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Animation Variants (Kept Consistent) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function LatestReleasesSection({ 
    title, 
    subtitle, 
    releases, 
    onPlay 
}: LatestReleasesSectionProps) {
  const router = useRouter();
  
  // Merge props with fallback
  const displayReleases = releases && releases.length > 0 ? releases : fallbackReleases;

  const handleItemClick = (item: ReleaseItem) => {
    router.push(`/media/${item.slug}`);
  };

  return (
    <section className="relative py-24 bg-white dark:bg-gray-950 overflow-hidden">
      
      {/* Subtle Grid Background (FROM YOUR ORIGINAL MEDIASECTION) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-widest uppercase mb-3"
            >
              Video Archive
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight"
            >
              {title || "Latest Official Releases"}
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-lg text-gray-600 dark:text-gray-400"
            >
                {subtitle || "Full-length keynotes, product demos, and executive interviews."}
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            onClick={() => router.push('/media/archive')}
            className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors py-2 px-4 rounded-full border border-indigo-200 dark:border-indigo-900"
          >
            View Full Archive
            <ArrowUpRightIcon className="h-4 w-4" />
          </motion.button>
        </div>

        {/* --- Grid --- */}
        <motion.div
          className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {displayReleases.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              // Card Styling Updated for consistency
              className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:border-indigo-500 transition-all duration-300 flex flex-col cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              
              {/* Video Thumbnail Area (16:9 Aspect Ratio) */}
              <div className="relative w-full aspect-video overflow-hidden">
                <Image decoding="async"
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 transition-opacity duration-300" />

                {/* Glassmorphic Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <button
                      onClick={(e) => { e.stopPropagation(); onPlay(item); }}
                      // Play Button Updated to match new accent color
                      className="flex items-center justify-center w-16 h-16 bg-white/30 backdrop-blur-md border border-white/50 rounded-full text-white shadow-xl ring-4 ring-indigo-500/30 hover:bg-indigo-600 hover:border-indigo-600 transition-all duration-300"
                  >
                      <PlayIcon className="w-7 h-7 ml-1" />
                  </button>
                </div>

                {/* Genre Badge (Top Left) - Updated Style */}
                {item.genre && (
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-200 bg-white/90 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-sm">
                            {item.genre}
                        </span>
                    </div>
                )}
              </div>

              {/* Content Info */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5 text-indigo-500" />
                        <span className='font-semibold'>{item.releaseDate}</span>
                    </div>
                    {item.videoSlug && <span className="text-indigo-600 dark:text-indigo-400 font-bold">New Video</span>}
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-snug mb-4 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                </h3>

                {/* Action Bar */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                    >
                        <InformationCircleIcon className="w-4 h-4 text-indigo-500" />
                        Details
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); /* Watchlist Logic */ }}
                        className="flex items-center justify-center p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-indigo-600 hover:border-indigo-600 dark:hover:text-white dark:hover:border-indigo-500 transition-colors"
                        title="Add to Watchlist"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
              </div>

            </motion.div>
          ))}
        </motion.div>

        {/* Unified Footer CTA (Replaced mobile-only button with a better styled CTA) */}
        <div className="mt-16 text-center">
            <motion.a 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                onClick={() => router.push('/media/archive')}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-300 cursor-pointer"
            >
                See All Videos
                <ArrowUpRightIcon className="w-5 h-5 ml-2" />
            </motion.a>
        </div>

      </div>
    </section>
  );
}