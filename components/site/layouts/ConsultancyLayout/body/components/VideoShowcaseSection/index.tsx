"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlayCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


// --- Types ---
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

// --- Lightbox Component ---
const Lightbox: React.FC<{
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ videoId, isOpen, onClose }) => {
  if (!isOpen) return null;
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full aspect-video flex items-center justify-center overflow-hidden"
        onClick={(e: any) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-white text-gray-800 rounded-full shadow-lg z-10 hover:bg-gray-200 transition"
          aria-label="Close video"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <iframe
          src={youtubeEmbedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-2xl"
          title="YouTube video player"
        ></iframe>
      </motion.div>
    </motion.div>
  );
};

// --- VideoShowcase Component ---
export default function VideoShowcase({ blogs }: VideoShowcaseProps) {
  const [isOpen, setIsOpen] = useState<string | null>(null);

  // --- Sample Data (for design preview) ---
  const sampleBlogs: IBlog[] = [
    {
      id: "1",
      title: "Building Confidence for Success",
      excerpt: "Learn how to unlock your inner power and transform self-doubt into lasting confidence.",
      coverImage: "/images/sample-coach1.jpg",
      videoAlbumId: "dQw4w9WgXcQ",
    },
    {
      id: "2",
      title: "Finding Purpose & Direction",
      excerpt: "Discover clarity in your career and life goals through guided self-reflection practices.",
      coverImage: "/images/sample-coach2.jpg",
      videoAlbumId: "JGwWNGJdvx8",
    },
    {
      id: "3",
      title: "Mastering Your Mindset",
      excerpt: "Shift your perspective to create abundance and fulfillment in every area of your life.",
      coverImage: "/images/sample-coach3.jpg",
      videoAlbumId: "3JZ_D3ELwOQ",
    },
  ];

  const data = blogs && blogs.length > 0 ? blogs : sampleBlogs;

  return (
    <section className="py-24 px-4 md:px-10 lg:px-20 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* --- Section Header --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Transformative Insights & Lessons
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore powerful video sessions on mindset, growth, and success — created to inspire your next step forward.
          </p>
        </motion.div>

        {/* --- Video Grid --- */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {data.map((blog) => (
            <motion.div
              key={blog.id}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer bg-white dark:bg-gray-800"
              onClick={() => blog.videoAlbumId && setIsOpen(blog.id)}
            >
              <div className="relative w-full aspect-video overflow-hidden">
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  loader={loader}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <PlayCircleIcon className="w-16 h-16 text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {blog.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* --- Lightbox --- */}
        <AnimatePresence>
          {data
            .filter((b) => b.videoAlbumId)
            .map((blog) => (
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
