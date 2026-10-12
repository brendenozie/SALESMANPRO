"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlayCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { IBlog } from "@/types/typings";
import { useEditableContent, EditableElement } from "@/contexts/EditableContentContext";

// Image loader
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

const defaultBlogs: IBlog[] = [
  {
    id: "blog-1",
    title: "Track Test: The 1,000 HP Hybrid Supercar Era",
    excerpt: "Exploring the boundary between combustion engineering and electric propulsion on Europe's premier test tracks.",
    coverImage: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=1200",
    slug: "track-test-supercar",
    videoAlbumId: "XxVg_s8xAms",
    author: "Automotive Journal",
    category: "Performance",
    createdAt: new Date().toISOString(),
  },
  {
    id: "blog-2",
    title: "Collector's Blueprint: Storing & Maintaining Exotics",
    excerpt: "Climate control, paint protection, and mechanical preservation strategies for long-term vehicular asset appreciation.",
    coverImage: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200",
    slug: "collectors-blueprint",
    videoAlbumId: "L61p2uyiMSo",
    author: "Heritage Workshop",
    category: "Concierge",
    createdAt: new Date().toISOString(),
  },
  {
    id: "blog-3",
    title: "Hyper-Grand Touring: The Alps Transversal Route",
    excerpt: "A high-altitude, multi-pass expedition testing bespoke grand tourers through Switzerland and Northern Italy.",
    coverImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200",
    slug: "hyper-grand-touring",
    videoAlbumId: "3fumBcKC6RE",
    author: "Expedition Crew",
    category: "Adventures",
    createdAt: new Date().toISOString(),
  },
];

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
  const { isEditorMode } = useEditableContent();
  const [isOpen, setIsOpen] = useState<string | null>(null);

  const activeBlogs = blogs && blogs.length > 0
    ? blogs
    : (isEditorMode ? defaultBlogs : []);

  if (activeBlogs.length === 0) {
    return null;
  }

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
            <EditableElement
              targetId="home.video-showcase.title"
              label="Section Title"
              inline
            >
              <span>Latest Video Blogs 🎬</span>
            </EditableElement>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            <EditableElement
              targetId="home.video-showcase.subtitle"
              label="Section Subtitle"
              type="textarea"
              inline
            >
              <span>Watch in-depth guides, property tours, and lifestyle stories directly from our blog.</span>
            </EditableElement>
          </p>
        </motion.div>

        {/* Blog Video Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
        >
          {activeBlogs.map((blog, idx) => (
            <motion.div
              key={blog.id || idx}
              whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0,0,0,0.15)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative cursor-pointer rounded-xl overflow-hidden shadow-xl group"
              onClick={() => blog.coverImage && setIsOpen(blog.id)}
            >
              <div className="relative w-full aspect-video overflow-hidden">
                <EditableElement
                  targetId={`home.video-showcase.items.${idx}.coverImage`}
                  label={`Blog #${idx + 1} Cover Image`}
                  type="image"
                  className="w-full h-full block relative"
                >
                  <Image decoding="async"
                    src={blog.coverImage || 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=1200'}
                    alt={blog.title}
                    fill
                    className="group-hover:scale-110 transition-transform duration-500 ease-in-out brightness-90 group-hover:brightness-70 object-cover"
                  />
                </EditableElement>
                {blog.coverImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <PlayCircleIcon className="w-16 h-16 text-white transform group-hover:scale-110 transition-transform duration-300" />
                  </div>
                )}
              </div>
              <div className="p-5 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                  <EditableElement
                    targetId={`home.video-showcase.items.${idx}.title`}
                    label={`Blog #${idx + 1} Title`}
                    inline
                  >
                    <span>{blog.title}</span>
                  </EditableElement>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <EditableElement
                    targetId={`home.video-showcase.items.${idx}.excerpt`}
                    label={`Blog #${idx + 1} Excerpt`}
                    type="textarea"
                    inline
                  >
                    <span>{blog.excerpt}</span>
                  </EditableElement>
                </p>
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
