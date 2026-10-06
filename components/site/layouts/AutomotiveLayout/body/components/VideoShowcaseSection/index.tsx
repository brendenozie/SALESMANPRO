"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlayCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { IBlog } from "@/types/typings";


// Image loader
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface VideoShowcaseProps {
  blogs: IBlog[];
}

// --- Lightbox Component ---
interface LightboxProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ videoId, isOpen, onClose }) => {
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
        className="relative bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full aspect-video flex items-center justify-center"
        onClick={(e:any) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 p-2 bg-white text-gray-800 rounded-full shadow-lg z-10 hover:bg-gray-200 transition"
          aria-label="Close video"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <iframe
          src={youtubeEmbedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
          title="YouTube video player"
        ></iframe>
      </motion.div>
    </motion.div>
  );
};

// --- VideoShowcase Component ---
export default function VideoShowcase({ blogs }: VideoShowcaseProps) {
  const [isOpen, setIsOpen] = useState<string | null>(null);

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Latest Video Blogs 🎬
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Watch in-depth guides, property tours, and lifestyle stories directly from our blog.
          </p>
        </motion.div>

        {/* Blog Video Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
        >
          {blogs.map((blog) => (
            <motion.div
              key={blog.id}
              whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0,0,0,0.15)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative cursor-pointer rounded-xl overflow-hidden shadow-xl group"
              onClick={() => blog.coverImage && setIsOpen(blog.id)}
            >
              <div className="relative w-full aspect-video overflow-hidden">
                <Image decoding="async"
                  src={blog.coverImage || ''}
                  alt={blog.title}
                  fill
                  className="group-hover:scale-110 transition-transform duration-500 ease-in-out brightness-90 group-hover:brightness-70 object-cover"
                />
                {blog.coverImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PlayCircleIcon className="w-16 h-16 text-white transform group-hover:scale-110 transition-transform duration-300" />
                  </div>
                )}
              </div>
              <div className="p-5 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {blog.excerpt}
                </p>
                {/* <Link
                  href={`/blog/${blog.slug}`}
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  Read Full Blog →
                </Link> */}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Lightbox Modals */}
        <AnimatePresence>
          {blogs
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
