"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { ClockIcon, PlayCircleIcon, UserIcon, WifiIcon } from "@heroicons/react/24/outline";

// --- Types ---
export interface IVideoClass {
  id: string;
  title: string;
  thumbnail: string;
  src: string;
  instructor: string;
  durationMinutes: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  isLive?: boolean;
}

// --- Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};
const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// --- Single Card ---
const VideoItem = ({
  id,
  title,
  thumbnail,
  src,
  instructor,
  durationMinutes,
  level,
  isLive,
  onClick,
}: IVideoClass & { onClick: () => void }) => (
  <motion.div
    key={id}
    className="relative cursor-pointer rounded-3xl overflow-hidden shadow-2xl hover:shadow-primary-accent/40 transition-all duration-500 transform snap-center border border-gray-200 group"
    variants={cardVariants}
    whileHover={{
      scale: 1.05,
      rotate: 1,
      y: -10,
      boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.5)",
    }}
    onClick={onClick}
  >
    {/* Thumbnail */}
    <div className="relative h-56 w-full overflow-hidden">
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Play Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.div
          className="p-4 bg-white/90 backdrop-blur-sm rounded-full text-indigo-600 shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <PlayCircleIcon className="h-10 w-10" />
        </motion.div>
      </div>

      {/* Live Badge */}
      {isLive && (
        <span className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
          LIVE <WifiIcon className="inline-block h-3 w-3 ml-1" />
        </span>
      )}
    </div>

    {/* Details */}
    <div className="p-5 flex flex-col space-y-2">
      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
        {title}
      </h3>
      <div className="flex items-center text-gray-600 text-sm">
        <UserIcon className="h-4 w-4 mr-1 text-indigo-400" /> {instructor}
      </div>
      <div className="flex items-center text-gray-600 text-sm">
        <ClockIcon className="h-4 w-4 mr-1 text-indigo-400" /> {durationMinutes} min
        <span
          className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold
            ${level === "Beginner"
              ? "bg-green-100 text-green-800"
              : level === "Intermediate"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"}`}
        >
          {level}
        </span>
      </div>
    </div>
  </motion.div>
);

// --- Component ---
const fallbackVideos: IVideoClass[] =  [
    {
        id: 'vid1',
        title: 'Full Body HIIT Blast',
        thumbnail: 'https://placehold.co/600x400/818CF8/FFFFFF?text=HIIT+Blast',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        instructor: 'Coach Alex',
        durationMinutes: 30,
        level: 'Advanced',
    },
    {
        id: 'vid2',
        title: 'Beginner Yoga Flow',
        thumbnail: 'https://placehold.co/600x400/A78BFA/FFFFFF?text=Yoga+Flow',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        instructor: 'Sarah Lee',
        durationMinutes: 45,
        level: 'Beginner',
        isLive: true,
    },
    {
        id: 'vid3',
        title: 'Core Strength & Stability',
        thumbnail: 'https://placehold.co/600x400/4F46E5/FFFFFF?text=Core+Strength',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        instructor: 'Dr. Emily',
        durationMinutes: 20,
        level: 'Intermediate',
    },
    {
        id: 'vid4',
        title: 'Mindful Meditation Guide',
        thumbnail: 'https://placehold.co/600x400/6366F1/FFFFFF?text=Meditation',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        instructor: 'Zen Master Kim',
        durationMinutes: 15,
        level: 'Beginner',
    },
    {
        id: 'vid5',
        title: 'Dance Cardio Party',
        thumbnail: 'https://placehold.co/600x400/818CF8/FFFFFF?text=Dance+Cardio',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        instructor: 'Javier Diaz',
        durationMinutes: 40,
        level: 'Intermediate',
        isLive: true,
    },
    {
        id: 'vid6',
        title: 'Advanced Weight Training',
        thumbnail: 'https://placehold.co/600x400/A78BFA/FFFFFF?text=Weight+Training',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
        instructor: 'Ben "The Beast" Green',
        durationMinutes: 60,
        level: 'Advanced',
    },
];
export default function VirtualClassesSection({ videos }: { videos?: IVideoClass[] }) {
  const [selectedVideo, setSelectedVideo] = useState<IVideoClass | null>(null);
  const dataToShow = videos && videos.length > 0 ? videos : fallbackVideos;

  return (
    <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.h2
          className="mb-14 text-4xl md:text-5xl font-extrabold text-center text-gray-900 leading-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          Dive Into Our <span className="text-indigo-700">Virtual Classes & On-Demand Library</span>
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {dataToShow.map((vid) => (
            <VideoItem key={vid.id} {...vid} onClick={() => setSelectedVideo(vid)} />
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="/virtual-library"
            className="inline-flex items-center px-8 py-4 bg-gray-900 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-gray-700 transition-transform hover:-translate-y-1"
          >
            Browse Full Video Library
            <ArrowRightIcon className="h-5 w-5 ml-3" />
          </a>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              className="relative w-full max-w-5xl bg-gray-900 rounded-3xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.7, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
                onClick={() => setSelectedVideo(null)}
              >
                ✕
              </button>
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent text-white font-semibold z-10">
                {selectedVideo.title}
              </div>
              <video
                key={selectedVideo.id}
                src={selectedVideo.src}
                controls
                autoPlay
                className="w-full h-auto aspect-video"
                onEnded={() => setSelectedVideo(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
