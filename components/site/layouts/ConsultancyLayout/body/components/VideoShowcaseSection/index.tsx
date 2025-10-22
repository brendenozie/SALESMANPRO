'use client';

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlayCircleIcon, XMarkIcon, VideoCameraIcon } from "@heroicons/react/24/solid"; // Added VideoCameraIcon
import Image from "next/image";
import Link from "next/link"; // Added Link for potential "View All" CTA

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


// --- Types (unchanged) ---
interface IBlog {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  videoAlbumId?: string;
}

interface VideoShowcaseProps {
  blogs?: IBlog[];
}

// --- Lightbox Component (Polished) ---
const Lightbox: React.FC<{
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ videoId, isOpen, onClose }) => {
  if (!isOpen) return null;
  // Ensure the video starts playing automatically when opened
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" // High z-index for modal
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full aspect-video flex items-center justify-center overflow-hidden"
        onClick={(e: any) => e.stopPropagation()} // Prevent closing when clicking inside the video frame
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 md:-top-12 md:-right-12 p-3 bg-white/30 text-white rounded-full backdrop-blur-sm shadow-xl z-20 hover:bg-white/50 transition duration-300"
          aria-label="Close video"
        >
          <XMarkIcon className="w-8 h-8" />
        </button>
        <iframe
          src={youtubeEmbedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          title="YouTube video player"
        ></iframe>
      </motion.div>
    </motion.div>
  );
};

// --- VideoShowcase Component (Visually Enhanced) ---
export default function VideoShowcase({ blogs }: VideoShowcaseProps) {
  const [isOpen, setIsOpen] = useState<string | null>(null);

  // --- Sample Data (for design preview) ---
  const sampleBlogs: IBlog[] = [
    {
      id: "1",
      title: "Building Confidence for Success",
      excerpt: "Learn how to unlock your inner power and transform self-doubt into lasting confidence.",
      coverImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
      videoAlbumId: "dQw4w9WgXcQ", // Placeholder video ID
    },
    {
      id: "2",
      title: "Finding Purpose & Direction",
      excerpt: "Discover clarity in your career and life goals through guided self-reflection practices.",
      coverImage: "https://images.unsplash.com/photo-1519389950473-41767a2cd60c?w=800&q=80",
      videoAlbumId: "JGwWNGJdvx8", // Placeholder video ID
    },
    {
      id: "3",
      title: "Mastering Your Mindset",
      excerpt: "Shift your perspective to create abundance and fulfillment in every area of your life.",
      coverImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
      videoAlbumId: "3JZ_D3ELwOQ", // Placeholder video ID
    },
  ];

  // Filter data to only show items that have a videoAlbumId
  const data = (blogs && blogs.length > 0 ? blogs : sampleBlogs).filter(blog => blog.videoAlbumId);

  return (
    <section className="py-24 px-4 md:px-10 lg:px-20 bg-gray-50 relative overflow-hidden">
      {/* Subtle Background Gradient for warmth */}
      <div className="absolute inset-0 z-0 opacity-20 bg-gradient-to-tr from-white to-orange-100/50"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* --- Section Header (More premium look) --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-lg font-semibold text-orange-700 uppercase tracking-wider mb-3 block">
            Video Library
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Watch & Learn: Instant <span className="text-orange-600">Growth</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Dive into our featured video sessions covering the essential strategies for career and personal mastery.
          </p>
        </motion.div>

        {/* --- Video Grid --- */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {data.slice(0, 3).map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(255,100,0,0.2)" }}
              className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer bg-white border border-gray-100 transition-all duration-300"
              onClick={() => blog.videoAlbumId && setIsOpen(blog.id)}
            >
              <div className="relative w-full aspect-video overflow-hidden">
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  loader={loader}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-all duration-300 group-hover:bg-opacity-20">
                  <PlayCircleIcon className="w-16 h-16 text-white drop-shadow-xl transform group-hover:scale-125 transition-transform duration-300 opacity-90" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-gray-600 text-base leading-snug line-clamp-2">
                  {blog.excerpt}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* --- View All CTA --- */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Link href="/blog" passHref>
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-3 bg-orange-600 text-white rounded-full font-bold shadow-lg hover:bg-orange-700 transition-all duration-300 cursor-pointer text-lg"
            >
              Explore Full Video Library
              <VideoCameraIcon className="w-5 h-5 ml-2" />
            </motion.span>
          </Link>
        </motion.div>


        {/* --- Lightbox --- */}
        <AnimatePresence>
          {data.filter((b) => b.id === isOpen && b.videoAlbumId).map((blog) => (
              <Lightbox
                key={blog.id}
                videoId={blog.videoAlbumId!}
                isOpen={isOpen === blog.id}
                onClose={() => setIsOpen(null)}
              />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}