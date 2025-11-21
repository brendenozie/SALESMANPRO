"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Image from "next/image";
import {
  PlayIcon,
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  VideoCameraIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";

// --- Utilities ---
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Sample Data ---
const tours = [
  {
    id: "vt1",
    title: "Amazon Canopy Expedition",
    location: "Brazil",
    duration: "5 min",
    category: "Nature",
    videoUrl: "https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1",
    thumbnail: "https://images.unsplash.com/photo-1546522301-447544d673f4?q=80&w=1287&auto=format&fit=crop",
  },
  {
    id: "vt2",
    title: "Midnight in Tokyo",
    location: "Japan",
    duration: "4 min",
    category: "Urban",
    videoUrl: "https://www.youtube.com/embed/5yS8K2b82oE?autoplay=1",
    thumbnail: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1287&auto=format&fit=crop",
  },
  {
    id: "vt3",
    title: "Serengeti Migration",
    location: "Tanzania",
    duration: "8 min",
    category: "Wildlife",
    videoUrl: "https://www.youtube.com/embed/FwV8h6rC2i0?autoplay=1",
    thumbnail: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1287&auto=format&fit=crop",
  },
  {
    id: "vt4",
    title: "Icelandic Glaciers",
    location: "Iceland",
    duration: "6 min",
    category: "Adventure",
    videoUrl: "https://www.youtube.com/embed/mzsqB1bX634?autoplay=1",
    thumbnail: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1287&auto=format&fit=crop",
  },
  {
    id: "vt5",
    title: "Santorini Sunset Walk",
    location: "Greece",
    duration: "3 min",
    category: "Relaxation",
    videoUrl: "https://www.youtube.com/embed/9G81iZ9gB50?autoplay=1",
    thumbnail: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1287&auto=format&fit=crop",
  },
];

// --- Components ---

const Modal = ({ videoUrl, onClose }: any) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
        onClick={(
          e: React.MouseEvent<HTMLDivElement, MouseEvent>
        ) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-all duration-300 group"
        >
          <XMarkIcon className="h-6 w-6 group-hover:rotate-90 transition-transform" />
        </button>
        <iframe
          src={videoUrl}
          title="Virtual Tour"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </motion.div>
    </motion.div>
  );
};

const TourCard = ({ tour, onPlay }: any) => {
  return (
    <motion.div
      className="group relative h-[450px] w-[300px] flex-shrink-0 rounded-[2rem] overflow-hidden cursor-pointer bg-gray-800"
      whileHover={{ y: -10 }}
      onClick={() => onPlay(tour.videoUrl)}
    >
      {/* Thumbnail */}
      <Image
        src={tour.thumbnail}
        alt={tour.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        loader={customLoader}
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      
      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      {/* Play Button - Centered */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative group-hover:scale-110 transition-transform duration-300">
           {/* Glow effect behind button */}
           <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-full" />
           <div className="relative h-16 w-16 bg-white/10 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-colors duration-300">
              <PlayIcon className="h-6 w-6 text-white ml-1" />
           </div>
        </div>
      </div>

      {/* Top Tags */}
      <div className="absolute top-6 left-6 flex gap-2">
        <span className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
          {tour.category}
        </span>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex items-center gap-4 text-gray-300 text-xs font-medium mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3" /> {tour.duration}</span>
            <span className="flex items-center gap-1"><VideoCameraIcon className="h-3 w-3" /> 4K Quality</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1 leading-tight">{tour.title}</h3>
        <p className="flex items-center text-gray-400 text-sm">
           <MapPinIcon className="h-3 w-3 mr-1 text-indigo-400" /> {tour.location}
        </p>
      </div>
    </motion.div>
  );
};

export default function VirtualTours() {
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Background texture opacity animation
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-24 bg-gray-900 relative overflow-hidden">
      
      {/* --- Atmospheric Background --- */}
      <div className="absolute inset-0 z-0">
        {/* Grain Texture (Optional, adds cinematic feel) */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        
        {/* Glow Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-900/40 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="max-w-2xl">
             <motion.span 
               initial={{ opacity: 0, x: -20 }}
               animate={isInView ? { opacity: 1, x: 0 } : {}}
               className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4"
             >
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Immersive Experience
             </motion.span>
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               animate={isInView ? { opacity: 1, y: 0 } : {}}
               transition={{ delay: 0.1 }}
               className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight"
             >
               Experience the World <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Before You Go.</span>
             </motion.h2>
          </div>

          <motion.div 
             initial={{ opacity: 0 }}
             animate={isInView ? { opacity: 1 } : {}}
             transition={{ delay: 0.3 }}
             className="hidden md:block"
          >
             <p className="text-gray-400 text-sm max-w-xs text-right leading-relaxed">
               Dive into high-definition virtual tours of our most exclusive destinations.
             </p>
          </motion.div>
        </div>

        {/* Carousel */}
        <motion.div 
          className="flex space-x-6 overflow-x-auto pb-12 px-4 md:px-0 hide-scrollbar snap-x snap-mandatory"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {tours.map((tour, index) => (
            <motion.div 
                key={tour.id} 
                className="snap-center"
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + (index * 0.1) }}
            >
              <TourCard tour={tour} onPlay={setModalUrl} />
            </motion.div>
          ))}
          
          {/* "View More" End Card */}
          <motion.div 
            className="snap-center flex-shrink-0 h-[450px] w-[200px] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
          >
             <div className="flex flex-col items-center gap-4 text-center group cursor-pointer">
                <div className="h-16 w-16 rounded-full border border-gray-700 group-hover:border-white flex items-center justify-center transition-colors duration-300">
                    <ArrowRightIcon className="h-6 w-6 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <span className="text-gray-500 font-bold text-sm uppercase tracking-widest group-hover:text-white transition-colors">
                    View All <br/> Tours
                </span>
             </div>
          </motion.div>
        </motion.div>

      </div>

      <AnimatePresence>
        {modalUrl && <Modal videoUrl={modalUrl} onClose={() => setModalUrl(null)} />}
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