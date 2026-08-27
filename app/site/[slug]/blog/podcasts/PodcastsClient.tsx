"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlayIcon, 
  PauseIcon,
  CalendarIcon, 
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SpeakerWaveIcon
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

export type PodcastEpisode = {
  id: string;
  title: string;
  description: string | null;
  audioUrl: string;
  coverImage: string | null;
  duration: string | null;
  publishedAt: string | null;
  createdAt: string;
  episodeNumber: number | null;
  seasonNumber: number | null;
};

interface PodcastsClientProps {
  episodes: PodcastEpisode[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export default function PodcastsClient({
  episodes,
  totalPages,
  currentPage,
}: PodcastsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { storeFormData } = useStoreContext() || {};

  // Active audio instantiation stack reference tracking states
  const [activeEpisode, setActiveEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const togglePlaybackInstance = (episode: PodcastEpisode) => {
    if (activeEpisode?.id === episode.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveEpisode(episode);
      setIsPlaying(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-400 py-20 px-4 sm:px-6 lg:px-8 font-sans pb-32 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* ===== AUDIO ARCHIVE HEADER ===== */}
        <div className="flex flex-col items-start pb-12 mb-12 border-b border-slate-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              Broadcast Index Tier
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">
            Audio Catalog
          </h1>
        </div>

        {/* ===== SYSTEM EPISODES GRID MATRIX ===== */}
        {episodes.length === 0 ? (
          <div className="py-24 text-center border border-slate-900 bg-slate-950 rounded">
            <p className="text-xs font-mono text-slate-600 tracking-wide uppercase">
              No audio program transcripts indexed for this terminal view.
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-900 border border-slate-900 rounded-lg overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
          >
            {episodes.map((episode) => {
              const isCurrent = activeEpisode?.id === episode.id;
              
              return (
                <motion.div
                  key={episode.id}
                  variants={itemVariants}
                  className="bg-slate-950 p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative transition-colors duration-150 hover:bg-slate-950/60 group"
                >
                  {/* Aspect Graphic Cover Wrapper */}
                  <div className="w-24 h-24 shrink-0 bg-slate-900 border border-slate-800 rounded overflow-hidden relative block group-hover:border-slate-700 transition-colors">
                    {episode.coverImage ? (
                      <img 
                        src={episode.coverImage} 
                        alt={episode.title}
                        className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-800" />
                    )}
                    
                    {/* Media Absolute Intercept Button */}
                    <button
                      onClick={() => togglePlaybackInstance(episode)}
                      className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isCurrent && isPlaying ? (
                        <PauseIcon className="h-6 w-6 text-white stroke-[2]" />
                      ) : (
                        <PlayIcon className="h-6 w-6 text-white fill-white" />
                      )}
                    </button>
                  </div>

                  {/* Program Summary Manifest Frame */}
                  <div className="flex-grow min-w-0 flex flex-col h-full justify-center">
                    <div className="flex items-center gap-2 mb-1.5 text-[10px] font-mono text-slate-500">
                      <span>EP. {episode.episodeNumber || "00"}</span>
                      {episode.seasonNumber && <span>• S{episode.seasonNumber}</span>}
                    </div>

                    <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase line-clamp-1 group-hover:text-white transition-colors mb-2">
                      {episode.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {episode.description || "No episode payload summary description provided to this index instance boundary."}
                    </p>

                    {/* Meta Data Ingestion Rows */}
                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600 pt-3 border-t border-slate-900">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {new Date(episode.publishedAt || episode.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                      </span>
                      {episode.duration && (
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {episode.duration} MINS
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ===== PAGINATION SYSTEM ===== */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-between items-center bg-slate-950 border border-slate-900 rounded p-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 px-3 rounded border border-slate-800 bg-slate-950 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white disabled:opacity-20 flex items-center gap-1 transition-colors"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" /> Prev
            </button>
            <span className="text-xs font-mono text-slate-600">PAGE {currentPage} / {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 px-3 rounded border border-slate-800 bg-slate-950 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white disabled:opacity-20 flex items-center gap-1 transition-colors"
            >
              Next <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* ===== GLOBAL PERSISTENT FOOTER MEDIA BAR LAYER ===== */}
      <AnimatePresence>
        {activeEpisode && (
          <motion.div 
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950 border-t border-slate-900 px-4 sm:px-8 flex items-center justify-between z-50 backdrop-blur-md bg-slate-950/95"
          >
            <div className="flex items-center gap-3 min-w-0 max-w-sm sm:max-w-md">
              <SpeakerWaveIcon className="h-4 w-4 text-slate-500 shrink-0 animate-pulse" style={{ color: isPlaying ? primaryColor : undefined }} />
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider truncate">
                  Now Streaming // EP. {activeEpisode.episodeNumber || "00"}
                </div>
                <div className="text-xs text-white font-medium tracking-wide truncate uppercase">
                  {activeEpisode.title}
                </div>
              </div>
            </div>

            {/* Simulated Stream Playback Intercept Interface */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center hover:border-slate-700 text-white transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <PlayIcon className="h-4 w-4 fill-white translate-x-0.5" />
                )}
              </button>
            </div>
            
            {/* HTML5 Audio Core Integration Side Effect Pipeline */}
            <audio 
              src={activeEpisode.audioUrl} 
              autoPlay={isPlaying}
              ref={(audioRef) => {
                if (!audioRef) return;
                if (isPlaying) {
                  audioRef.play().catch(() => setIsPlaying(false));
                } else {
                  audioRef.pause();
                }
              }}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}