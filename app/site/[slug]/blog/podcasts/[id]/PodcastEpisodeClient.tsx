"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  PlayIcon, 
  PauseIcon, 
  CalendarIcon, 
  ClockIcon, 
  ChevronLeftIcon,
  SpeakerWaveIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useStoreContext } from "@/contexts/StoreContext";

interface PodcastEpisodeClientProps {
  episode: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    audioUrl: string;
    coverImage: string | null;
    duration: string | null;
    publishedAt: string | null;
    createdAt: string;
    episodeNumber: number | null;
    seasonNumber: number | null;
  };
}

export default function PodcastEpisodeClient({ episode }: PodcastEpisodeClientProps) {
  const { storeFormData } = useStoreContext() || {};
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTimeToken = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-400 pb-32 font-sans relative selection:bg-slate-900 selection:text-white">
      
      {/* ===== HEADER CONTEXT CRUMB NAV ===== */}
      <nav className="w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto h-14 flex items-center justify-between">
          <Link 
            href="/podcasts" 
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-200 transition-colors uppercase tracking-wider group"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Audio Archive
          </Link>
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest hidden sm:block truncate max-w-sm">
            EP {episode.episodeNumber || "00"} // COMPILING TIMELINE
          </div>
        </div>
      </nav>

      {/* ===== INTEGRATED MEDIA CONTROL BAY ===== */}
      <div className="max-w-4xl mx-auto px-4 pt-16 sm:pt-24 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center pb-12 border-b border-slate-900">
        
        {/* Left Aspect Grid: Frame Wrapper Cover */}
        <div className="md:col-span-4 aspect-square max-w-[240px] md:max-w-none mx-auto w-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden relative group">
          {episode.coverImage ? (
            <img 
              src={episode.coverImage} 
              alt={episode.title} 
              className="w-full h-full object-cover grayscale opacity-75 group-hover:grayscale-0 transition-all duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-800" />
          )}
          {isPlaying && (
            <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 p-2 rounded-full">
              <SpeakerWaveIcon className="h-4 w-4 animate-pulse" style={{ color: primaryColor }} />
            </div>
          )}
        </div>

        {/* Right Aspect Grid: Metadata Core Stream Dashboard */}
        <div className="md:col-span-8 flex flex-col justify-center items-start w-full">
          <div className="flex items-center gap-2 mb-3 text-[10px] font-mono text-slate-500 tracking-wider">
            <span>EPISODE {episode.episodeNumber || "00"}</span>
            {episode.seasonNumber && <span>• SEASON {episode.seasonNumber}</span>}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight leading-tight mb-4">
            {episode.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-500 mb-8 w-full">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5" />
              {new Date(episode.publishedAt || episode.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </span>
            {episode.duration && (
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                {episode.duration} MINUTES TARGET
              </span>
            )}
          </div>

          {/* INTERNAL TRACK SLIDER BAR CONTROLS */}
          <div className="w-full space-y-2 bg-slate-900/40 border border-slate-900 rounded p-4 sm:p-5">
            <div className="flex items-center gap-4">
              {/* Core Execution Switch Trigger */}
              <button
                onClick={togglePlayback}
                className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center active:scale-[0.98] transition-all select-none"
                style={{ backgroundColor: primaryColor }}
              >
                {isPlaying ? (
                  <PauseIcon className="h-5 w-5 text-slate-950 stroke-[2.5]" />
                ) : (
                  <PlayIcon className="h-5 w-5 text-slate-950 fill-slate-950 translate-x-0.5" />
                )}
              </button>

              <div className="flex-grow space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleScrub}
                  className="w-full h-1 bg-slate-800 accent-white rounded-lg appearance-none cursor-pointer focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${(currentTime / (duration || 1)) * 100}%, #1e293b ${(currentTime / (duration || 1)) * 100}%, #1e293b 100%)`
                  }}
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>{formatTimeToken(currentTime)}</span>
                  <span>{formatTimeToken(duration)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ===== TRANSCRIPT SUMMARY INFORMATION BLOCK ===== */}
      <main className="max-w-3xl mx-auto px-4 pt-12">
        <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-900 pb-2">
          Program Breakdown & Payload Digest
        </h2>
        
        <div className="text-sm text-slate-400 leading-relaxed space-y-6">
          {episode.description ? (
            <p className="whitespace-pre-wrap">{episode.description}</p>
          ) : (
            <p className="text-xs font-mono text-slate-600 italic">
              No supplementary manifest breakdown provided for this timeline log.
            </p>
          )}
        </div>
      </main>

      {/* ===== HIDDEN HTML5 RUNTIME HOOKS LAYER ===== */}
      <audio
        ref={audioRef}
        src={episode.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

    </div>
  );
}