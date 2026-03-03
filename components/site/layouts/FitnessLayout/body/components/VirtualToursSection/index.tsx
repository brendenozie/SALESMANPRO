"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightIcon,
  ClockIcon,
  PlayIcon,
  UserIcon,
  SignalIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";

// --- Types ---
export interface IMediaExperience {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  location?: string;
  category?: string;
  instructor?: string;
  isLive?: boolean;
}

const customLoader = ({ src }: any) => src;

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

// --- Sub-component: Video Card ---
const VideoItem = ({
  title,
  thumbnail,
  duration,
  category,
  instructor,
  isLive,
  onClick,
}: IMediaExperience & { onClick: () => void }) => (
  <motion.div
    variants={cardVariants}
    onClick={onClick}
    className="group relative cursor-pointer bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:bg-white/10 transition-all duration-500"
  >
    {/* Thumbnail Container */}
    <div className="relative h-64 w-full overflow-hidden">
      <Image
        loader={customLoader}
        src={thumbnail}
        alt={title}
        fill
        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
      />
      
      {/* Cinematic Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
        <div className="w-16 h-16 flex items-center justify-center bg-orange-500 rounded-full text-black shadow-[0_0_30px_rgba(249,115,22,0.5)]">
          <PlayIcon className="h-8 w-8 ml-1" />
        </div>
      </div>

      {/* Status Badges */}
      <div className="absolute top-5 left-5 flex gap-2">
        {isLive && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest animate-pulse">
            <SignalIcon className="h-3 w-3" />
            Live Now
          </div>
        )}
        <div className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
          {category}
        </div>
      </div>
    </div>

    {/* Info Footer */}
    <div className="p-6">
      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight mb-4 group-hover:text-orange-500 transition-colors">
        {title}
      </h3>
      
      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex items-center gap-2 text-gray-400">
          <UserIcon className="h-4 w-4 text-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">{instructor}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <ClockIcon className="h-4 w-4 text-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">{duration}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Main Section ---
export default function VirtualClassesSection({
  videos = [],
}: {
  videos?: IMediaExperience[];
}) {
  const [selectedVideo, setSelectedVideo] = useState<IMediaExperience | null>(null);

  const dataToShow = videos.length > 0 ? videos : [
    {
      id: "1",
      title: "Shadow Boxing: Pro Protocol",
      thumbnail: "https://images.unsplash.com/photo-1599058917232-d750c185967c?q=80&w=2000&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1",
      duration: "45 MIN",
      instructor: "COACH VANCE",
      category: "STRIKING",
      isLive: true
    },
    {
      id: "2",
      title: "Bio-Mechanical Power Flow",
      thumbnail: "https://images.unsplash.com/photo-1518611012118-29a8d63ee0c2?q=80&w=2000&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/q_2h_2Q00c0?autoplay=1",
      duration: "30 MIN",
      instructor: "MARCUS REED",
      category: "MOBILITY",
    },
    {
      id: "3",
      title: "Metabolic Threshold HIIT",
      thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2000&auto=format&fit=crop",
      videoUrl: "https://www.youtube.com/embed/FwV8h6rC2i0?autoplay=1",
      duration: "20 MIN",
      instructor: "SARA JANE",
      category: "CARDIO",
    }
  ];

  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-orange-500/10 blur-[150px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <span className="text-orange-500 font-black tracking-[0.4em] uppercase text-xs">Digital Dojo</span>
            <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8]">
              Virtual <br /> <span className="text-white/10">Archive</span>
            </h2>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-6">
            <p className="max-w-[320px] text-gray-400 font-medium text-sm leading-relaxed text-left md:text-right">
              Train from anywhere. Zero excuses. Access our encrypted high-performance library 24/7.
            </p>
            <motion.a
              href="/virtual-library"
              whileHover={{ x: 5 }}
              className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-xs border-b-2 border-orange-500 pb-2"
            >
              Full Library <ArrowRightIcon className="w-4 h-4 text-orange-500" />
            </motion.a>
          </div>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {dataToShow.map((vid) => (
            <VideoItem
              key={vid.id}
              {...vid}
              onClick={() => setSelectedVideo(vid)}
            />
          ))}
        </motion.div>
      </div>

      {/* Cinematic Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-10"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl aspect-video bg-[#111] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)]"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-6 right-6 z-50 p-3 bg-black/50 hover:bg-orange-500 text-white hover:text-black rounded-full transition-all"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              
              <iframe
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}