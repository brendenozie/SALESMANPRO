"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  PlayIcon,
  XMarkIcon,
  ArrowUpRightIcon,
  ChartBarIcon,
  SparklesIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

// --- Shared Utilities ---
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

const blurSvg = `data:image/svg+xml;base64,${btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#e0e0e0" />
    <circle cx="50" cy="50" r="20" fill="#bdbdbd" />
  </svg>
`)}`;

// --- Fallback Data ---
const fallbackTours = [
  {
    id: "vt1",
    title: "Amazon Canopy Walk",
    thumbnail: "https://images.unsplash.com/photo-1546522301-447544d673f4?q=80&w=2940&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    duration: "4:30",
    location: "Brazil",
  },
  {
    id: "vt2",
    title: "Rome at Sunset",
    thumbnail: "https://images.unsplash.com/photo-1552832230-c0197cefa08d?q=80&w=2940&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    duration: "6:15",
    location: "Italy",
  },
  {
    id: "vt3",
    title: "Kyoto Tea Ceremony",
    thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2940&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    duration: "5:00",
    location: "Japan",
  },
];

const fallbackCosts = [
  { id: "rc1", region: "Western Europe", avgCost: 2200, level: 85 }, // Level 0-100 for bar width
  { id: "rc2", region: "Southeast Asia", avgCost: 1100, level: 40 },
  { id: "rc3", region: "North America", avgCost: 2800, level: 95 },
];

const fallbackPosts = [
  {
    id: "bp1",
    title: "The Solo Traveler's Handbook",
    category: "Guide",
    readTime: "5 min read",
    url: "/blog/solo-travel",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "bp2",
    title: "Hidden Gems in Portugal",
    category: "Inspiration",
    readTime: "3 min read",
    url: "/blog/portugal",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd81?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "bp3",
    title: "Packing Light: A Masterclass",
    category: "Tips",
    readTime: "6 min read",
    url: "/blog/packing",
    image: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=200&auto=format&fit=crop"
  },
];

// --- Sub-Components ---

const Modal = ({ videoUrl, onClose }: any) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <iframe
          src={videoUrl}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </motion.div>
    </motion.div>
  );
};

const VideoCard = ({ tour, onOpen }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="relative h-80 w-56 flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer group shadow-md"
    onClick={() => onOpen(tour.videoUrl)}
  >
    <Image decoding="async"
      src={tour.thumbnail}
      alt={tour.title}
      fill
      className="object-cover transition-transform duration-700 group-hover:scale-110"
    />
    {/* Dark Gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
    
    {/* Play Button Overlay */}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="h-12 w-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
            <PlayIcon className="h-6 w-6 text-white ml-1" />
        </div>
    </div>

    {/* Content */}
    <div className="absolute bottom-4 left-4 right-4 text-white">
      <div className="flex items-center gap-2 mb-1">
        <span className="px-2 py-0.5 bg-indigo-600 rounded text-[10px] font-bold uppercase tracking-wide">
            {tour.location}
        </span>
        <span className="text-xs text-gray-300 font-medium flex items-center">
            <ClockIcon className="h-3 w-3 mr-1" /> {tour.duration}
        </span>
      </div>
      <h4 className="font-bold leading-tight">{tour.title}</h4>
    </div>
  </motion.div>
);

const CostRow = ({ item }: any) => (
  <div className="flex items-center gap-4 py-3 border-b border-dashed border-gray-100 last:border-0">
    <div className="flex-1">
      <div className="flex justify-between items-end mb-1">
        <span className="font-semibold text-gray-800 text-sm">{item.region}</span>
        <span className="font-bold text-indigo-600 text-sm">${item.avgCost.toLocaleString()}</span>
      </div>
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: `${item.level}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
        />
      </div>
    </div>
  </div>
);

const BlogPostItem = ({ post }: any) => (
  <Link href={post.url || '#'} className="group flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors duration-300">
    <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
        <Image decoding="async" src={post.image} alt={post.title} fill className="object-cover"/>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{post.category}</span>
          <span className="text-[10px] text-gray-400">• {post.readTime}</span>
      </div>
      <h4 className="text-sm font-bold text-gray-900 leading-snug truncate group-hover:text-indigo-600 transition-colors">
        {post.title}
      </h4>
    </div>
    <ArrowUpRightIcon className="h-4 w-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
  </Link>
);

// --- Main Component ---
export default function MarketInsights({ virtualTours, regionCosts, blogPosts }: any) {
  const [modalVideoUrl, setModalVideoUrl] = useState(null);

  const tours = virtualTours?.length ? virtualTours : fallbackTours;
  const costs = regionCosts?.length ? regionCosts : fallbackCosts;
  const blogs = blogPosts?.length ? blogPosts : fallbackPosts;

  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-12 md:flex md:items-end md:justify-between">
            <div className="max-w-2xl">
                <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-2 flex items-center gap-2"
                >
                    <SparklesIcon className="h-4 w-4" />
                    Inspiration Station
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight"
                >
                    Curated Insights & Previews
                </motion.h2>
            </div>
            <div className="hidden md:block">
                 <p className="text-gray-500 text-sm text-right">Updated weekly with <br/>fresh data and stories.</p>
            </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-auto lg:h-[600px]">
          
          {/* Main Module: Virtual Tours (Spans 8 cols) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8 bg-gray-900 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden flex flex-col justify-center"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 blur-[80px] opacity-40 rounded-full pointer-events-none" />

            <div className="relative z-10 mb-6">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <PlayIcon className="h-6 w-6 text-indigo-400" />
                    Immersive Previews
                </h3>
                <p className="text-gray-400 max-w-md">Experience the atmosphere before you book. Take a virtual walk through our most requested locations.</p>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="relative z-10 flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                 {tours.map((tour: any) => (
                     <VideoCard key={tour.id} tour={tour} onOpen={setModalVideoUrl} />
                 ))}
                 {/* View All Card */}
                 <Link href="/virtual-tours" className="relative h-80 w-40 flex-shrink-0 rounded-2xl border-2 border-dashed border-gray-700 hover:border-indigo-500 flex flex-col items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer group snap-start">
                     <span className="text-sm font-bold uppercase tracking-wider mb-2">View All</span>
                     <div className="h-10 w-10 rounded-full bg-gray-800 group-hover:bg-indigo-600 flex items-center justify-center transition-colors">
                        <ArrowUpRightIcon className="h-5 w-5" />
                     </div>
                 </Link>
            </div>
          </motion.div>

          {/* Right Column (Spans 4 cols) - Split into two rows */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8 h-full">
            
            {/* Top Right: Costs */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex-1 bg-white rounded-[2rem] p-6 shadow-xl shadow-indigo-100/50 border border-gray-100 flex flex-col"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5 text-emerald-500" />
                        Avg. Trip Costs
                    </h3>
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">Per Person</span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    {costs.map((cost: any) => (
                        <CostRow key={cost.id} item={cost} />
                    ))}
                </div>
            </motion.div>

            {/* Bottom Right: Blogs */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex-1 bg-white rounded-[2rem] p-6 shadow-xl shadow-indigo-100/50 border border-gray-100 flex flex-col"
            >
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Latest Reads</h3>
                    <Link href="/blog" className="text-xs font-bold text-indigo-600 hover:underline">View All</Link>
                </div>
                <div className="flex flex-col gap-2">
                    {blogs.map((post: any) => (
                        <BlogPostItem key={post.id} post={post} />
                    ))}
                </div>
            </motion.div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {modalVideoUrl && (
          <Modal videoUrl={modalVideoUrl} onClose={() => setModalVideoUrl(null)} />
        )}
      </AnimatePresence>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}