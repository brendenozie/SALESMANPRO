"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  PlayIcon, 
  PauseIcon, 
  CalendarIcon, 
  ClockIcon, 
  ChevronLeftIcon,
  SpeakerWaveIcon,
  ForwardIcon,
  BackwardIcon,
  LockClosedIcon,
  SparklesIcon,
  ShareIcon,
  BookmarkIcon,
  HandThumbUpIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { resolvePodcastMedia, formatAudioDuration } from "@/lib/media/content-media-resolver";
import { useContentTelemetry } from "@/hooks/useContentTelemetry";

interface PodcastEpisodeClientProps {
  episode: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    audioUrl: string;
    coverImage?: string | null;
    coverImageUrl?: string | null;
    duration: string | number | null;
    publishedAt: string | null;
    createdAt: string;
    episodeNumber: number | null;
    seasonNumber: number | null;
    companyId?: string;
    isPremium?: boolean;
    price?: number;
    currency?: string;
    previewDuration?: number;
  };
}

export default function PodcastEpisodeClient({ episode }: PodcastEpisodeClientProps) {
  const media = resolvePodcastMedia(episode);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isPremium = Boolean(episode.isPremium && (episode.price || 0) > 0);
  const previewLimit = episode.previewDuration || 30; // 30s free preview default

  // Access & Paywall State
  const [hasAccess, setHasAccess] = useState(!isPremium);
  const [paywallTriggered, setPaywallTriggered] = useState(false);
  const [phone, setPhone] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(media.durationSeconds || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);

  // Telemetry Hook
  const {
    recordPodcastImpression,
    recordPodcastPlayStart,
    recordPodcastProgress,
    recordPodcastLike,
    recordPodcastShare,
    recordPodcastBookmark,
    recordPodcastPaywallView,
    recordPodcastPurchase,
  } = useContentTelemetry({
    podcastId: episode.id,
    companyId: episode.companyId,
    channel: "STORE",
  });

  useEffect(() => {
    recordPodcastImpression();
  }, [recordPodcastImpression]);

  // Check Content Access
  useEffect(() => {
    if (!isPremium) {
      setHasAccess(true);
      return;
    }

    const checkAccess = async () => {
      try {
        const res = await fetch(`/api/content/access?contentType=PODCAST&contentId=${episode.id}`);
        const data = await res.json();
        if (data.hasAccess) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch {
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [episode.id, isPremium]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!hasAccess && currentTime >= previewLimit) {
        setPaywallTriggered(true);
        recordPodcastPaywallView(episode.price);
        return;
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        recordPodcastPlayStart();
      }).catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);

    // Paywall preview cutoff
    if (!hasAccess && cur >= previewLimit) {
      audioRef.current.pause();
      setIsPlaying(false);
      setPaywallTriggered(true);
      recordPodcastPaywallView(episode.price);
      return;
    }

    recordPodcastProgress(cur, duration || audioRef.current.duration || 1);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      if (!isNaN(dur) && dur > 0) {
        setDuration(dur);
      }
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    if (!hasAccess && newTime >= previewLimit) {
      audioRef.current.pause();
      audioRef.current.currentTime = previewLimit;
      setCurrentTime(previewLimit);
      setIsPlaying(false);
      setPaywallTriggered(true);
      recordPodcastPaywallView(episode.price);
      return;
    }
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const seekRelative = (seconds: number) => {
    if (!audioRef.current) return;
    let target = audioRef.current.currentTime + seconds;
    if (!hasAccess && target >= previewLimit) {
      target = previewLimit;
      setPaywallTriggered(true);
      recordPodcastPaywallView(episode.price);
    }
    target = Math.max(0, Math.min(target, duration));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!episode.companyId) return;

    setPurchasing(true);
    setPurchaseMessage(null);

    try {
      const res = await fetch("/api/content/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "PODCAST",
          contentId: episode.id,
          companyId: episode.companyId,
          phoneNumber: phone,
          paymentMethod: "MPESA",
        }),
      });

      const data = await res.json();
      if (data.success && data.hasAccess) {
        setHasAccess(true);
        setPaywallTriggered(false);
        recordPodcastPurchase(episode.price || 0);
        setPurchaseMessage("Episode unlocked! Resuming playback...");
        if (audioRef.current) {
          audioRef.current.play().then(() => setIsPlaying(true));
        }
      } else {
        throw new Error(data.error || "Payment prompt sent. Please authorize on your phone.");
      }
    } catch (err: any) {
      setPurchaseMessage(err.message || "Failed to initiate payment");
    } finally {
      setPurchasing(false);
    }
  };

  const handleLike = () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikesCount((prev) => prev + 1);
    recordPodcastLike();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: episode.title, url: window.location.href });
    }
    recordPodcastShare();
  };

  const handleBookmark = async () => {
    const next = !hasBookmarked;
    setHasBookmarked(next);
    if (next) recordPodcastBookmark();
    try {
      await fetch(`/api/site/${episode.companyId}/me/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: next ? "bookmark" : "unbookmark",
          contentType: "PODCAST",
          contentId: episode.id,
        }),
      });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-400 pb-32 font-sans relative selection:bg-slate-900 selection:text-white">
      {/* Nav Context Bar */}
      <nav className="w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto h-14 flex items-center justify-between">
          <Link
            href="/blog/podcasts"
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-200 transition-colors uppercase tracking-wider group"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Audio Archive
          </Link>
          <div className="flex items-center gap-4 text-xs font-mono">
            {isPremium && (
              <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px] uppercase font-bold">
                <SparklesIcon className="w-3 h-3" /> Premium Episode
              </span>
            )}
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1 transition-colors ${
                hasBookmarked ? "text-amber-400 font-bold" : "hover:text-white"
              }`}
            >
              <BookmarkIcon className={`w-3.5 h-3.5 ${hasBookmarked ? "fill-amber-400" : ""}`} />
              {hasBookmarked ? "Saved" : "Save"}
            </button>
            <button onClick={handleShare} className="flex items-center gap-1 hover:text-white transition-colors">
              <ShareIcon className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </nav>

      {/* Integrated Media Player Bay */}
      <div className="max-w-4xl mx-auto px-4 pt-16 sm:pt-24 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center pb-12 border-b border-slate-900">
        {/* Cover Art Frame */}
        <div className="md:col-span-4 aspect-square max-w-[260px] md:max-w-none mx-auto w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative group shadow-2xl">
          <img
            src={media.coverUrl}
            alt={episode.title}
            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 transition-all duration-500"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1080&q=80";
            }}
          />
          {isPlaying && (
            <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-2.5 rounded-full shadow-lg">
              <SpeakerWaveIcon className="h-4 w-4 animate-pulse text-amber-500" />
            </div>
          )}
        </div>

        {/* Player Stream Control Panel */}
        <div className="md:col-span-8 flex flex-col justify-center items-start w-full">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-slate-500 tracking-wider">
            <span>EPISODE {episode.episodeNumber || "01"}</span>
            {episode.seasonNumber && <span>• SEASON {episode.seasonNumber}</span>}
            {!hasAccess && (
              <span className="text-amber-400 font-bold ml-2">
                [FREE PREVIEW: {previewLimit}s]
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight leading-tight mb-4">
            {episode.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-500 mb-6 w-full">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5" />
              {new Date(episode.publishedAt || episode.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).toUpperCase()}
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5" />
              {media.durationFormatted}
            </span>
          </div>

          {/* Interactive Player Console */}
          <div className="w-full space-y-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-4">
              {/* Backward 15s */}
              <button
                onClick={() => seekRelative(-15)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Rewind 15s"
              >
                <BackwardIcon className="w-5 h-5" />
              </button>

              {/* Play / Pause Primary Button */}
              <button
                onClick={togglePlayback}
                className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all text-slate-950 shadow-lg shadow-amber-500/25"
              >
                {isPlaying ? (
                  <PauseIcon className="h-6 w-6 stroke-[2.5]" />
                ) : (
                  <PlayIcon className="h-6 w-6 fill-slate-950 translate-x-0.5" />
                )}
              </button>

              {/* Forward 15s */}
              <button
                onClick={() => seekRelative(15)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Forward 15s"
              >
                <ForwardIcon className="w-5 h-5" />
              </button>

              {/* Scrubber & Wave Meter */}
              <div className="flex-grow space-y-1.5 ml-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleScrub}
                  className="w-full h-1.5 bg-slate-800 accent-amber-500 rounded-lg appearance-none cursor-pointer focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${
                      (currentTime / (duration || 1)) * 100
                    }%, #1e293b ${(currentTime / (duration || 1)) * 100}%, #1e293b 100%)`,
                  }}
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>{formatAudioDuration(currentTime)}</span>
                  <span>{formatAudioDuration(duration)}</span>
                </div>
              </div>

              {/* Speed Rate Switcher */}
              <button
                onClick={cyclePlaybackRate}
                className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300 hover:text-white transition-colors"
              >
                {playbackRate}x
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Paywall Modal Card */}
      {paywallTriggered && !hasAccess && (
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400">
              <LockClosedIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Full Episode Locked</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              You've finished the free {previewLimit}s preview. Unlock complete uninterrupted access to this episode for{" "}
              <strong className="text-amber-400">
                {episode.currency || "KES"} {(episode.price || 0).toLocaleString()}
              </strong>
              .
            </p>

            <form onSubmit={handleUnlock} className="max-w-sm mx-auto space-y-4">
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="M-Pesa Number (e.g. 0712345678)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={purchasing}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {purchasing ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" /> Processing M-Pesa STK...
                  </>
                ) : (
                  <>Unlock Complete Audio ({episode.currency || "KES"} {episode.price})</>
                )}
              </button>

              {purchaseMessage && (
                <p className="text-xs font-mono text-amber-400 pt-2">{purchaseMessage}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Episode Digest & Transcript */}
      <main className="max-w-3xl mx-auto px-4 pt-12">
        <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-900 pb-2 flex items-center justify-between">
          <span>Program Breakdown & Synopsis</span>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-[11px] font-mono transition-colors ${
              hasLiked ? "text-amber-400 font-bold" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <HandThumbUpIcon className="w-3.5 h-3.5" /> {likesCount} Likes
          </button>
        </h2>

        <div className="text-sm text-slate-300 leading-relaxed space-y-6">
          {episode.description ? (
            <p className="whitespace-pre-wrap">{episode.description}</p>
          ) : (
            <p className="text-xs font-mono text-slate-600 italic">
              No supplementary notes provided for this broadcast.
            </p>
          )}
        </div>
      </main>

      {/* HTML5 Audio Player */}
      <audio
        ref={audioRef}
        src={media.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}