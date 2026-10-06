"use client";

import React, { useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  PlayIcon,
  XMarkIcon,
  VideoCameraIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { IBlog } from "@/types/typings";

/* -------------------------------------------------------------------------- */
/* Constants & Commercial Mock Fallbacks */
/* -------------------------------------------------------------------------- */
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2670&auto=format&fit=crop";

const DUMMY_BLOGS: Partial<IBlog>[] = [
  {
    id: "v1",
    slug: "howo-sinotruk-fleet-review",
    title: "Howo Sinotruk 371HP Fleet Walkaround & Performance Test",
    excerpt:
      "An in-depth inspection of heavy haulage tippers operating across tough terrain and site conditions.",
    coverImage:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2670&auto=format&fit=crop",
    videoAlbumId: "dQw4w9WgXcQ",
  },
  {
    id: "v2",
    slug: "isuzu-fvr-box-body-guide",
    title: "Commercial Box Body Truck Buying Guide & Maintenance",
    excerpt:
      "Key factors to consider when choosing medium-duty cargo trucks for commercial logistics operations.",
    coverImage:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2670&auto=format&fit=crop",
    videoAlbumId: "3JZ_D3ELwOQ",
  },
  {
    id: "v3",
    slug: "caterpillar-excavator-inspection",
    title: "Hydraulic Excavator Pre-Purchase Yard Inspection Checklist",
    excerpt:
      "Watch our site engineers review hydraulic pressure, track wear, and engine health in heavy machinery.",
    coverImage:
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2670&auto=format&fit=crop",
    videoAlbumId: "L_LUpnjgPso",
  },
];

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

/* -------------------------------------------------------------------------- */
/* Animation Variants */
/* -------------------------------------------------------------------------- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 110, damping: 18 },
  },
};

/* -------------------------------------------------------------------------- */
/* Subcomponents */
/* -------------------------------------------------------------------------- */

const GridPattern = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
    <svg className="h-full w-full text-slate-900 dark:text-white" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="video-grid-pattern"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 32L32 0H16L0 16M32 32V16L16 32"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#video-grid-pattern)" />
    </svg>
  </div>
);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-5xl w-full aspect-video flex items-center justify-center overflow-hidden"
        onClick={(e: any) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 bg-slate-800 text-slate-300 rounded-full shadow-lg z-20 hover:bg-amber-500 hover:text-slate-950 transition-all border border-slate-700"
          aria-label="Close video"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
        <iframe
          src={youtubeEmbedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-3xl"
          title="YouTube video player"
        ></iframe>
      </motion.div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */

interface VideoShowcaseProps {
  blogs?: IBlog[];
}

export default function VideoShowcase({ blogs = [] }: VideoShowcaseProps) {
  const [isOpen, setIsOpen] = useState<string | null>(null);
  const displayBlogs = blogs.length > 0 ? blogs : (DUMMY_BLOGS as IBlog[]);

  const activeBlog = displayBlogs.find((b) => b.id === isOpen);

  return (
    <section className="relative py-20 md:py-28 bg-slate-50 dark:bg-[#080B10] text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800/80 overflow-hidden transition-colors duration-300">
      <GridPattern />

      {/* Ambient Accent Glow */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm"
          >
            <VideoCameraIcon className="w-4 h-4" />
            <span>Fleet Media & Video Reviews</span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Commercial <span className="text-amber-600 dark:text-amber-400">Video Showcase</span>
          </motion.h2>

          <motion.p
            className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Watch machinery yard walkarounds, heavy equipment field tests, and operational guides.
          </motion.p>
        </div>

        {/* Video Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {displayBlogs.map((blog) => {
            const cover = blog.coverImage || FALLBACK_IMAGE;

            return (
              <motion.div
                key={blog.id}
                variants={cardVariants}
                className="h-full"
              >
                <div
                  className="group relative flex flex-col justify-between h-[390px] w-full rounded-3xl bg-white dark:bg-[#0F141C] border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-amber-500/10 cursor-pointer"
                  onClick={() => blog.videoAlbumId && setIsOpen(blog.id)}
                >
                  {/* Media / Video Stage */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-950">
                    <Image decoding="async"
                      src={cover}
                      alt={blog.title || "Video thumbnail"}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 dark:opacity-80 group-hover:opacity-70 dark:group-hover:opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                    {/* Hover Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:bg-amber-400 transition-all duration-300">
                        <PlayIcon className="w-7 h-7 ml-0.5 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2">
                        {blog.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-auto">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        Watch Review <PlayIcon className="w-3 h-3 fill-current" />
                      </span>

                      {blog.slug && (
                        <Link
                          href={`/blog/${blog.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
                        >
                          Read Article <ArrowRightIcon className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {activeBlog && activeBlog.videoAlbumId && (
            <Lightbox
              key={activeBlog.id}
              videoId={activeBlog.videoAlbumId}
              isOpen={Boolean(isOpen)}
              onClose={() => setIsOpen(null)}
            />
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}