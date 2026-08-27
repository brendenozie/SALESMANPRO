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
import { useStoreContext } from "@/contexts/StoreContext";
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

const customLoader = ({ src }: { src: string }) => src;

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
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
  primaryColor,
}: IMediaExperience & { onClick: () => void; primaryColor: string }) => (
  <motion.div
    variants={cardVariants}
    onClick={onClick}
    whileHover={{ y: -6 }}
    className="group relative cursor-pointer bg-white dark:bg-neutral-900/40 backdrop-blur-sm border border-neutral-200/80 dark:border-neutral-800/60 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-neutral-900 transition-all duration-500 flex flex-col justify-between"
  >
    <div>
      {/* Thumbnail Container */}
      <div className="relative h-60 sm:h-64 w-full overflow-hidden">
        <Image
          loader={customLoader}
          src={thumbnail}
          alt={title}
          fill
          className="object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Cinema Layer Masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent opacity-85 dark:opacity-75 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Ambient Play Trigger Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100 z-10">
          <div 
            className="w-16 h-16 flex items-center justify-center rounded-full text-white transition-transform duration-300 shadow-lg"
            style={{ 
              backgroundColor: primaryColor,
              boxShadow: `0 0 30px ${primaryColor}4D`
            }}
          >
            <PlayIcon className="h-6 w-6 ml-1 text-white" />
          </div>
        </div>

        {/* Dynamic Contextual Floating Tags */}
        <div className="absolute top-5 left-5 flex flex-wrap gap-2 z-10">
          {isLive && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 rounded-full text-[9px] font-bold text-white uppercase tracking-widest animate-pulse shadow-sm">
              <SignalIcon className="h-3 w-3" />
              Live Now
            </div>
          )}
          <div className="px-3 py-1 bg-neutral-950/70 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-bold text-white uppercase tracking-widest shadow-sm">
            {category}
          </div>
        </div>
      </div>

      {/* Card Typography Details */}
      <div className="p-6 sm:p-8 space-y-4">
        <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter leading-none group-hover:opacity-80 transition-opacity">
          {title}
        </h3>
      </div>
    </div>

    {/* Metadata Card Footer */}
    <div className="px-6 pb-6 sm:px-8 sm:pb-8">
      <div className="flex items-center justify-between border-t border-neutral-200/60 dark:border-neutral-800/60 pt-4 text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <UserIcon className="h-4 w-4 opacity-70" style={{ color: primaryColor }} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{instructor}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ClockIcon className="h-4 w-4 opacity-70" style={{ color: primaryColor }} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{duration}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Main Responsive Section Component ---
export default function VirtualClassesSection({
  videos = [],
}: {
  videos?: IMediaExperience[];
}) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";
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
    <section className="py-24 sm:py-32 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 relative overflow-hidden">
      
      {/* Decorative Brand Ambience Fluid Spot */}
      <div 
        className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] opacity-[0.05] dark:opacity-[0.04] blur-[130px] rounded-full pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Interactive Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <span className="font-black tracking-[0.3em] uppercase text-xs block animate-fade-in" style={{ color: primaryColor }}>
              Digital Dojo
            </span>
            <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black text-neutral-900 dark:text-white italic tracking-tighter uppercase leading-[0.85] transition-colors">
              Virtual <br /> <span className="text-neutral-300 dark:text-neutral-800 transition-colors">Archive</span>
            </h2>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-5 max-w-sm">
            <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm sm:text-base leading-relaxed text-left md:text-right transition-colors">
              Train from anywhere with zero friction. Connect with our synchronized hyper-performance virtual asset archive 24/7.
            </p>
            <motion.a
              href="/virtual-library"
              whileHover={{ x: 6 }}
              className="flex items-center gap-2.5 text-neutral-900 dark:text-white font-bold uppercase tracking-wider text-xs pb-1.5 border-b-2 transition-colors duration-300"
              style={{ borderBottomColor: primaryColor }}
            >
              <span>Full Library</span> 
              <ArrowRightIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            </motion.a>
          </div>
        </div>

        {/* Dynamic Studio Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
        >
          {dataToShow.map((vid) => (
            <VideoItem
              key={vid.id}
              {...vid}
              primaryColor={primaryColor}
              onClick={() => setSelectedVideo(vid)}
            />
          ))}
        </motion.div>
      </div>

      {/* Cinematic Modal Stream Layer */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/90 dark:bg-black/95 backdrop-blur-xl p-4 sm:p-6 md:p-10"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-neutral-200/20 dark:border-neutral-800/60 shadow-[0_24px_60px_rgba(0,0,0,0.8)]"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Dynamic Interactive Close Action */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 sm:p-3 bg-black/60 hover:scale-105 text-white rounded-full transition-all border border-white/10"
                style={{ ["--hover-bg" as any]: primaryColor }}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              
              <iframe
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                className="w-full h-full border-none"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}